package com.SyncClinic.payment_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.SyncClinic.payment_service.dto.events.PaymentFailedEvent;
import com.SyncClinic.payment_service.dto.events.PaymentInitiatedEvent;
import com.SyncClinic.payment_service.dto.events.PaymentSuccessEvent;
import com.SyncClinic.payment_service.dto.request.CreatePaymentRequest;
import com.SyncClinic.payment_service.dto.response.AppointmentDetails;
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
    private final AppointmentServiceClient appointmentClient;
    private final PatientServiceClient patientServiceClient;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${stripe.publishable.key}")
    private String stripePublishableKey;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentEventPublisher eventPublisher,
                          AppointmentServiceClient appointmentClient,
                          PatientServiceClient patientServiceClient) {
        this.paymentRepository = paymentRepository;
        this.eventPublisher = eventPublisher;
        this.appointmentClient = appointmentClient;
        this.patientServiceClient = patientServiceClient;
    }

    /**
     * POST /api/payments/intent
     *
     * Flow:
     * 1. Verify appointment is COMPLETED (403 if not)
     * 2. Create Stripe PaymentIntent in LKR
     * 3. Save PENDING record to DB
     * 4. Return clientSecret + publishableKey to frontend
     */
    @Transactional
    public PaymentResponse createPaymentIntent(CreatePaymentRequest request) {

        // Step 1 — Verify appointment is COMPLETED before allowing payment
        AppointmentDetails appointment = appointmentClient.getAndVerifyAppointment(request.getAppointmentId());
        String patientId = appointment.getPatientId();
        String patientEmail = appointment.getPatientEmail() != null && !appointment.getPatientEmail().isBlank()
                ? appointment.getPatientEmail()
            : patientServiceClient.getPatientEmail(patientId);

        if (patientId == null || patientId.isBlank()) {
            throw new PaymentException("Unable to identify patient for payment request");
        }

        // Use consultation fee from appointment record
        // Stripe requires amount in smallest unit — LKR uses cents (1 LKR = 100 cents)
        java.math.BigDecimal fee = appointment.getConsultationFee() != null
                ? appointment.getConsultationFee()
                : new java.math.BigDecimal("1500.00"); // fallback default fee

        long amountInCents = fee.multiply(java.math.BigDecimal.valueOf(100)).longValue();

        String doctorName = appointment.getDoctorName() != null ? appointment.getDoctorName() : "Doctor";
        String doctorId = appointment.getDoctorId() != null ? appointment.getDoctorId() : "unknown";

        try {
            // Step 2 — Create Stripe PaymentIntent in LKR
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("lkr")  // Sri Lankan Rupee as per requirement
                    .setDescription("SyncClinic consultation - " + doctorName)
                    .putMetadata("appointmentId", request.getAppointmentId())
                    .putMetadata("patientId", patientId)
                    .putMetadata("patientEmail", patientEmail)
                    .putMetadata("doctorId", doctorId)
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Step 3 — Save PENDING record to DB
            Payment payment = new Payment();
            payment.setPatientId(patientId);
            payment.setPatientEmail(patientEmail);
            payment.setAppointmentId(request.getAppointmentId());
            payment.setDoctorId(doctorId);
            payment.setDoctorName(doctorName);
            payment.setAmount(fee);
            payment.setCurrency("lkr");
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setStripePaymentIntentId(paymentIntent.getId());
            payment.setStripeClientSecret(paymentIntent.getClientSecret());

            Payment saved = paymentRepository.save(payment);
            log.info("Created PaymentIntent {} for patient {} - appointment {}",
                    paymentIntent.getId(), patientId, request.getAppointmentId());

                // Notify notification-service immediately when patient proceeds to payment.
                eventPublisher.publishPaymentInitiated(new PaymentInitiatedEvent(
                    saved.getId(),
                    saved.getAppointmentId(),
                    saved.getPatientId(),
                    saved.getPatientEmail(),
                    saved.getDoctorId(),
                    saved.getDoctorName(),
                    saved.getAmount() != null ? saved.getAmount().toPlainString() : null,
                    saved.getCurrency(),
                    LocalDateTime.now().toString()
                ));

            // Step 4 — Return clientSecret to frontend
            return mapToResponse(saved);

        } catch (StripeException e) {
            log.error("Stripe error creating PaymentIntent: {}", e.getMessage());
            throw new PaymentException("Failed to create payment: " + e.getMessage());
        }
    }

    /**
     * POST /api/payments/webhook
     *
     * Stripe calls this after payment completes.
     * Updates DB status and fires Kafka events.
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

            // Update to PAID (matching prompt requirement)
            payment.setStatus(Payment.PaymentStatus.PAID);

            // Store charge ID if available
            if (intent.getLatestCharge() != null) {
                payment.setStripeChargeId(intent.getLatestCharge());
            }
            paymentRepository.save(payment);

            // Notify appointment-service to mark payment as PAID
            appointmentClient.updatePaymentStatus(payment.getAppointmentId(), "PAID");

                // Publish RabbitMQ event -> notification-service sends confirmation
            eventPublisher.publishPaymentSuccess(new PaymentSuccessEvent(
                    payment.getId(),
                    payment.getAppointmentId(),
                    payment.getPatientId(),
                    payment.getPatientEmail(),
                    payment.getDoctorId(),
                    payment.getDoctorName(),
                    payment.getAmount() != null ? payment.getAmount().toPlainString() : null,
                    payment.getCurrency(),
                    LocalDateTime.now(),
                    "Stripe Card"));

            log.info("Payment PAID: {} for appointment {}", payment.getId(), payment.getAppointmentId());
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

                // Publish RabbitMQ event -> notification-service informs patient
            eventPublisher.publishPaymentFailed(new PaymentFailedEvent(
                    payment.getId(),
                    payment.getAppointmentId(),
                    payment.getPatientId(),
                    payment.getPatientEmail(),
                    payment.getDoctorId(),
                    payment.getAmount() != null ? payment.getAmount().toPlainString() : null,
                    payment.getCurrency(),
                    reason,
                    LocalDateTime.now()));

            log.warn("Payment FAILED: {} - {}", payment.getId(), reason);
        });
    }

    // --- Patient endpoints ---

    public List<PaymentResponse> getMyPayments() {
        return getMyPayments(null);
    }

    public List<PaymentResponse> getMyPayments(String patientId) {
        if (patientId == null || patientId.isBlank()) {
            return paymentRepository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return paymentRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponse getPaymentByAppointment(String appointmentId) {
        return paymentRepository.findTopByAppointmentIdOrderByCreatedAtDesc(appointmentId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new PaymentException("No payment found for appointment: " + appointmentId));
    }

    // --- Admin endpoints ---

    public List<PaymentResponse> getAllPayments(int page, int size) {
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(page, size);
        return paymentRepository.findAll(pageable)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long getTotalPaymentsCount() {
        return paymentRepository.count();
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
                stripePublishableKey,
                p.getCreatedAt(),
                p.getFailureReason());
    }
}