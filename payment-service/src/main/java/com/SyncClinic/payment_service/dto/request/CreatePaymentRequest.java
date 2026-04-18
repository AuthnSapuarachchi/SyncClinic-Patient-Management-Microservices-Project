package com.SyncClinic.payment_service.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Patient sends only the appointmentId.
 * The payment service fetches the consultation fee and doctor details
 * from the appointment-service internally.
 */
public class CreatePaymentRequest {

    @NotBlank(message = "Appointment ID is required")
    private String appointmentId;

    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }
}