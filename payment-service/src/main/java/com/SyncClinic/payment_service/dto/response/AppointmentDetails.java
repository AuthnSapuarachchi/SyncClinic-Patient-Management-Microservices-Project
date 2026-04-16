package com.SyncClinic.payment_service.dto.response;

import java.math.BigDecimal;

/**
 * Represents the data we fetch from the appointment-service
 * to verify status and get the consultation fee.
 */
public class AppointmentDetails {

    private String id;
    private String patientId;
    private String patientEmail;
    private String doctorId;
    private String doctorName;
    private String status;           // PENDING | CONFIRMED | COMPLETED | CANCELLED
    private BigDecimal consultationFee;
    private String paymentStatus;    // UNPAID | PAID

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}