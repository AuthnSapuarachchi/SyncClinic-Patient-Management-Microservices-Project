package com.SyncClinic.payment_service.controller;

import com.SyncClinic.payment_service.dto.request.CreatePaymentRequest;
import com.SyncClinic.payment_service.dto.response.PaymentResponse;
import com.SyncClinic.payment_service.service.PaymentService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/payments")
public class PaymentController {
 
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
 
    /**
     * POST /api/payments/initiate
     * Patient initiates payment for an appointment.
     * Returns a Stripe clientSecret that the frontend uses to render the card form.
     */
    @PostMapping("/initiate")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PaymentResponse> initiatePayment(
            @Valid @RequestBody CreatePaymentRequest request) {
 
        String token = getTokenFromContext();
        PaymentResponse response = paymentService.createPaymentIntent(request, token);
        return ResponseEntity.ok(response);
    }
 
    /**
     * POST /api/payments/webhook
     * Stripe calls this endpoint after payment is completed.
     * This MUST be public (no JWT) — Stripe signs it with its own signature.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
 
        paymentService.handleStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
 
    /**
     * GET /api/payments/my
     * Patient views their own payment history.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {
        String token = getTokenFromContext();
        return ResponseEntity.ok(paymentService.getMyPayments(token));
    }
 
    /**
     * GET /api/payments/appointment/{appointmentId}
     * Check payment status for a specific appointment.
     * Accessible by PATIENT, DOCTOR, or ADMIN.
     */
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByAppointment(
            @PathVariable String appointmentId) {
        return ResponseEntity.ok(paymentService.getPaymentsByAppointment(appointmentId));
    }
 
    /**
     * GET /api/payments/admin/all
     * Admin views all transactions on the platform.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
 
    // Helper to pull the raw JWT from the Spring Security context
    private String getTokenFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new IllegalStateException("No authentication found in security context");
        }

        Object details = authentication.getDetails();
        if (details instanceof String token) {
            return token;
        }

        throw new IllegalStateException("JWT token is not available in authentication details");
    }
}