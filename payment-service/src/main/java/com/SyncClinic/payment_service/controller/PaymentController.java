package com.SyncClinic.payment_service.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.SyncClinic.payment_service.dto.request.CreatePaymentRequest;
import com.SyncClinic.payment_service.dto.response.PaymentResponse;
import com.SyncClinic.payment_service.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * POST /api/payments/intent
     * Patient initiates payment for a COMPLETED appointment.
     * Returns clientSecret + publishableKey for frontend Stripe.js.
     *
     * Returns 403 if appointment is not yet COMPLETED.
     */
    @PostMapping("/intent")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PaymentResponse> createPaymentIntent(
            @Valid @RequestBody CreatePaymentRequest request) {

        String token = getTokenFromContext();
        PaymentResponse response = paymentService.createPaymentIntent(request, token);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/payments/webhook
     * Stripe calls this after payment is completed.
     * MUST be public — Stripe signs with its own header, no JWT.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Boolean>> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        paymentService.handleStripeWebhook(payload, sigHeader);
        Map<String, Boolean> response = new HashMap<>();
        response.put("received", true);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/payments/:appointmentId
     * Get payment status for a specific appointment.
     * Returns: { status, transactionId, amount }
     */
    @GetMapping("/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<PaymentResponse> getPaymentByAppointment(
            @PathVariable String appointmentId) {
        return ResponseEntity.ok(paymentService.getPaymentByAppointment(appointmentId));
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
     * GET /api/payments/admin/all?page=0
     * Admin views all transactions with pagination.
     * Returns: { transactions: [], total }
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<PaymentResponse> transactions = paymentService.getAllPayments(page, size);
        long total = paymentService.getTotalPaymentsCount();

        Map<String, Object> response = new HashMap<>();
        response.put("transactions", transactions);
        response.put("total", total);
        return ResponseEntity.ok(response);
    }

    // Helper: pull the raw JWT string from Spring Security context
    private String getTokenFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new IllegalStateException("No authentication found");
        }
        Object details = authentication.getDetails();
        if (details instanceof String token) {
            return token;
        }
        throw new IllegalStateException("JWT token not available in authentication details");
    }
}