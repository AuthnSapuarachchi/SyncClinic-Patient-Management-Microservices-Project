package com.SyncClinic.payment_service.dto.events;

import java.time.LocalDateTime;
 
/**
 * Published to RabbitMQ route "payment.success".
 * The notification-service listens to this and sends
 * confirmation SMS/email to patient and doctor.
 */
public class PaymentSuccessEvent {
 
    private String paymentId;
    private String appointmentId;
    private String patientId;
    private String patientEmail;
    private String doctorId;
    private String doctorName;
    private String amount;
    private String currency;
    private LocalDateTime paidAt;
     private String paymentMethod;
 
    public PaymentSuccessEvent() {
    }
 
    public PaymentSuccessEvent(String paymentId,
                               String appointmentId,
                               String patientId,
                               String patientEmail,
                               String doctorId,
                               String doctorName,
                               String amount,
                               String currency,
                               LocalDateTime paidAt,
                               String paymentMethod) {
        this.paymentId = paymentId;
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.patientEmail = patientEmail;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.amount = amount;
        this.currency = currency;
        this.paidAt = paidAt;
        this.paymentMethod = paymentMethod;
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
 
    public String getDoctorName() {
        return doctorName;
    }
 
    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
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
 
    public LocalDateTime getPaidAt() {
        return paidAt;
    }
 
    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
 