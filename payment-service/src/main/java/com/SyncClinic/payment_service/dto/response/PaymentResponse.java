package com.SyncClinic.payment_service.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.SyncClinic.payment_service.entity.Payment;
 
public class PaymentResponse {
 
    private String paymentId;
    private String appointmentId;
    private String doctorName;
    private BigDecimal amount;
    private String currency;
    private Payment.PaymentStatus status;
    private String clientSecret;   // Stripe client secret — frontend uses this to show the payment form
    private String publishableKey; // Stripe publishable key for client-side Stripe.js initialization
    private LocalDateTime createdAt;
    private String failureReason;
 
    public PaymentResponse() {
    }
 
    public PaymentResponse(String paymentId,
                           String appointmentId,
                           String doctorName,
                           BigDecimal amount,
                           String currency,
                           Payment.PaymentStatus status,
                           String clientSecret,
                           String publishableKey,
                           LocalDateTime createdAt,
                           String failureReason) {
        this.paymentId = paymentId;
        this.appointmentId = appointmentId;
        this.doctorName = doctorName;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.clientSecret = clientSecret;
        this.publishableKey = publishableKey;
        this.createdAt = createdAt;
        this.failureReason = failureReason;
    }
 
    public String getPaymentId() {
        return paymentId;
    }
 
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
 
    public String getAppointmentId() {
        return appointmentId;
    }
 
    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }
 
    public String getDoctorName() {
        return doctorName;
    }
 
    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }
 
    public BigDecimal getAmount() {
        return amount;
    }
 
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
 
    public String getCurrency() {
        return currency;
    }
 
    public void setCurrency(String currency) {
        this.currency = currency;
    }
 
    public Payment.PaymentStatus getStatus() {
        return status;
    }
 
    public void setStatus(Payment.PaymentStatus status) {
        this.status = status;
    }
 
    public String getClientSecret() {
        return clientSecret;
    }
 
    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
 
    public String getPublishableKey() {
        return publishableKey;
    }
 
    public void setPublishableKey(String publishableKey) {
        this.publishableKey = publishableKey;
    }
 
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
 
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
 
    public String getFailureReason() {
        return failureReason;
    }
 
    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }
}