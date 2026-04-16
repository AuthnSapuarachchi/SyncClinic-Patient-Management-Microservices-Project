package com.SyncClinic.payment_service.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
 
public class CreatePaymentRequest {
 
    @NotBlank(message = "Appointment ID is required")
    private String appointmentId;
 
    @NotBlank(message = "Doctor ID is required")
    private String doctorId;
 
    @NotBlank(message = "Doctor name is required")
    private String doctorName;
 
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.50", message = "Minimum payment is $0.50")
    private BigDecimal amount;
 
    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^[a-z]{3}$", message = "Currency must be a 3-letter code e.g. usd")
    private String currency;
 
    public String getAppointmentId() {
        return appointmentId;
    }
 
    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
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
}
 