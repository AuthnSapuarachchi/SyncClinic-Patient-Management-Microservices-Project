package com.SyncClinic.payment_service.dto.events;

/**
 * Published to RabbitMQ route "payment.initiated" when a patient clicks
 * Proceed to Payment and a payment intent is created.
 */
public class PaymentInitiatedEvent {

    private String paymentId;
    private String appointmentId;
    private String patientId;
    private String patientEmail;
    private String doctorId;
    private String doctorName;
    private String amount;
    private String currency;
    private String initiatedAt;

    public PaymentInitiatedEvent() {
    }

    public PaymentInitiatedEvent(String paymentId,
                                 String appointmentId,
                                 String patientId,
                                 String patientEmail,
                                 String doctorId,
                                 String doctorName,
                                 String amount,
                                 String currency,
                                 String initiatedAt) {
        this.paymentId = paymentId;
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.patientEmail = patientEmail;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.amount = amount;
        this.currency = currency;
        this.initiatedAt = initiatedAt;
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

    public String getInitiatedAt() {
        return initiatedAt;
    }

    public void setInitiatedAt(String initiatedAt) {
        this.initiatedAt = initiatedAt;
    }
}
