package com.SyncClinic.payment_service.dto.events;

import java.time.LocalDateTime;
 
/**
 * Published to RabbitMQ route "payment.failed".
 * Notification-service listens to this to inform
 * the patient that their payment was unsuccessful.
 */
public class PaymentFailedEvent {
 
    private String paymentId;
    private String appointmentId;
    private String patientId;
    private String patientEmail;
    private String doctorId;
    private String amount;
    private String currency;
    private String failureReason;
    private LocalDateTime failedAt;
 
    public PaymentFailedEvent() {
    }
 
    public PaymentFailedEvent(String paymentId,
                              String appointmentId,
                              String patientId,
                              String patientEmail,
                              String doctorId,
                              String amount,
                              String currency,
                              String failureReason,
                              LocalDateTime failedAt) {
        this.paymentId = paymentId;
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.patientEmail = patientEmail;
        this.doctorId = doctorId;
        this.amount = amount;
        this.currency = currency;
        this.failureReason = failureReason;
        this.failedAt = failedAt;
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
 
    public String getPatientId() {
        return patientId;
    }
 
    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }
 
    public String getPatientEmail() {
        return patientEmail;
    }
 
    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
 
    public String getFailureReason() {
        return failureReason;
    }
 
    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }
 
    public LocalDateTime getFailedAt() {
        return failedAt;
    }
 
    public void setFailedAt(LocalDateTime failedAt) {
        this.failedAt = failedAt;
    }
}
 