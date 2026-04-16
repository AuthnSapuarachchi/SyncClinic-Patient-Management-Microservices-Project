package com.SyncClinic.payment_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.SyncClinic.payment_service.config.JwtUtil;
import com.SyncClinic.payment_service.dto.events.PaymentFailedEvent;
import com.SyncClinic.payment_service.dto.events.PaymentSuccessEvent;
import com.SyncClinic.payment_service.dto.request.CreatePaymentRequest;
import com.SyncClinic.payment_service.dto.response.PaymentResponse;
import com.SyncClinic.payment_service.entity.Payment;
import com.SyncClinic.payment_service.exception.PaymentException;
import com.SyncClinic.payment_service.repository.PaymentRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
 
@Service
public class PaymentService {
 
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
 
    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher eventPublisher;
    private final JwtUtil jwtUtil;
 
    @Value("${stripe.webhook.secret}")
    private String webhookSecret;
 
    public PaymentService(PaymentRepository paymentRepository,
                          PaymentEventPublisher eventPublisher,
                          JwtUtil jwtUtil) {
        this.paymentRepository = paymentRepository;
        this.eventPublisher = eventPublisher;
        this.jwtUtil = jwtUtil;
    }
 
    /**
     * Step 1: Patient clicks "Pay Now" → we create a PaymentIntent in Stripe
     * and return the clientSecret to the frontend so it can render the card form.
     */
    @Transactional
    public PaymentResponse createPaymentIntent(CreatePaymentRequest request, String jwtToken) {
 
        // Extract patient info from their JWT
        String patientId = jwtUtil.extractUserId(jwtToken);
        String patientEmail = jwtUtil.extractUsername(jwtToken);
 
        try {
            // Create PaymentIntent in Stripe (amount must be in smallest currency unit, e.g. cents)
            long amountInCents = request.getAmount()
                    .multiply(java.math.BigDecimal.valueOf(100))
                    .longValue();
 
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(request.getCurrency())
                    .setDescription("SyncClinic consultation - Dr. " + request.getDoctorName())
                    .putMetadata("appointmentId", request.getAppointmentId())
                    .putMetadata("patientId", patientId)
                    .putMetadata("patientEmail", patientEmail)
                    .putMetadata("doctorId", request.getDoctorId())
                    .build();
 
            PaymentIntent paymentIntent = PaymentIntent.create(params);
 
            // Save to our DB with PENDING status
            Payment payment = new Payment();
            payment.setPatientId(patientId);
            payment.setPatientEmail(patientEmail);
            payment.setAppointmentId(request.getAppointmentId());
            payment.setDoctorId(request.getDoctorId());
            payment.setDoctorName(request.getDoctorName());
            payment.setAmount(request.getAmount());
            payment.setCurrency(request.getCurrency());
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setStripePaymentIntentId(paymentIntent.getId());
            payment.setStripeClientSecret(paymentIntent.getClientSecret());
 
            Payment saved = paymentRepository.save(payment);
            log.info("Created PaymentIntent {} for patient {}", paymentIntent.getId(), patientId);
 
            return mapToResponse(saved);
 
        } catch (StripeException e) {
            log.error("Stripe error creating PaymentIntent: {}", e.getMessage());
            throw new PaymentException("Failed to create payment: " + e.getMessage());
        }
    }
 
    /**
     * Step 2: Stripe calls our webhook after the payment completes (success or fail).
     * This is the most important method — it updates the DB and fires Kafka events.
     */
    @Transactional
    public void handleStripeWebhook(String payload, String sigHeader) {
 
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe webhook signature");
            throw new PaymentException("Invalid webhook signature");
        }
 
        log.info("Received Stripe webhook event: {}", event.getType());
 
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
 
        switch (event.getType()) {
 
            case "payment_intent.succeeded" -> {
                deserializer.getObject().ifPresent(obj -> {
                    PaymentIntent intent = (PaymentIntent) obj;
                    handlePaymentSuccess(intent);
                });
            }
 
            case "payment_intent.payment_failed" -> {
                deserializer.getObject().ifPresent(obj -> {
                    PaymentIntent intent = (PaymentIntent) obj;
                    handlePaymentFailed(intent);
                });
            }
 
            default -> log.debug("Unhandled Stripe event type: {}", event.getType());
        }
    }
 
    private void handlePaymentSuccess(PaymentIntent intent) {
        paymentRepository.findByStripePaymentIntentId(intent.getId()).ifPresent(payment -> {
            payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
            paymentRepository.save(payment);
 
            // Fire Kafka event → notification-service will send confirmation email/SMS
            eventPublisher.publishPaymentSuccess(new PaymentSuccessEvent(
                    payment.getId(),
                    payment.getAppointmentId(),
                    payment.getPatientId(),
                    payment.getPatientEmail(),
                    payment.getDoctorId(),
                    payment.getDoctorName(),
                    payment.getAmount(),
                    payment.getCurrency(),
                    LocalDateTime.now()));
 
            log.info("Payment {} succeeded for appointment {}", payment.getId(), payment.getAppointmentId());
        });
    }
 
    private void handlePaymentFailed(PaymentIntent intent) {
        paymentRepository.findByStripePaymentIntentId(intent.getId()).ifPresent(payment -> {
 
            String reason = intent.getLastPaymentError() != null
                    ? intent.getLastPaymentError().getMessage()
                    : "Payment declined";
 
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason(reason);
            paymentRepository.save(payment);
 
            // Fire Kafka event → notification-service will inform patient
            eventPublisher.publishPaymentFailed(new PaymentFailedEvent(
                    payment.getId(),
                    payment.getAppointmentId(),
                    payment.getPatientId(),
                    payment.getPatientEmail(),
                    reason,
                    LocalDateTime.now()));
 
            log.warn("Payment {} failed: {}", payment.getId(), reason);
        });
    }
 
    /**
     * Get all payments for the currently logged-in patient.
     */
    public List<PaymentResponse> getMyPayments(String jwtToken) {
        String patientId = jwtUtil.extractUserId(jwtToken);
        return paymentRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
 
    /**
     * Get payment status for a specific appointment (used by appointment-service).
     */
    public List<PaymentResponse> getPaymentsByAppointment(String appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
 
    // --- Admin endpoints ---
 
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
 
    // --- Helper ---
 
    private PaymentResponse mapToResponse(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getAppointmentId(),
                p.getDoctorName(),
                p.getAmount(),
                p.getCurrency(),
                p.getStatus(),
                p.getStripeClientSecret(),
                p.getCreatedAt(),
                p.getFailureReason());
    }
}