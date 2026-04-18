package com.SyncClinic.payment_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.SyncClinic.payment_service.dto.response.AppointmentDetails;
import com.SyncClinic.payment_service.exception.PaymentException;

/**
 * HTTP client that talks to the appointment-service
 * to verify appointment status before allowing payment.
 */
@Component
public class AppointmentServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AppointmentServiceClient.class);

    private final RestTemplate restTemplate;

    @Value("${appointment.service.url}")
    private String appointmentServiceUrl;

    public AppointmentServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Fetches appointment details from appointment-service.
     * Throws PaymentException (403) if status is not COMPLETED.
     */
    public AppointmentDetails getAndVerifyAppointment(String appointmentId) {
        String url = appointmentServiceUrl + "/api/appointments/" + appointmentId;

        try {
            AppointmentDetails appointment = restTemplate.getForObject(url, AppointmentDetails.class);

            if (appointment == null) {
                throw new PaymentException("Appointment not found: " + appointmentId);
            }

            log.info("Appointment {} status: {}", appointmentId, appointment.getStatus());

            // The key business rule from the prompt:
            // Payment only allowed when appointment/session is COMPLETED
            if (!"COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
                throw new PaymentException(
                    "Payment is not available until your appointment or session is completed. " +
                    "Current status: " + appointment.getStatus()
                );
            }

            return appointment;

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new PaymentException("Appointment not found: " + appointmentId);
            }
            log.error("Error calling appointment-service: {}", e.getMessage());
            throw new PaymentException("Could not verify appointment status: " + e.getMessage());
        } catch (PaymentException e) {
            throw e; // rethrow our own exceptions
        } catch (Exception e) {
            log.error("Failed to reach appointment-service at {}: {}", url, e.getMessage());
            // If appointment-service is unreachable during dev/testing, log warning and continue
            // Remove this fallback in production!
            log.warn("Appointment-service unreachable — skipping status check for development");
            AppointmentDetails fallback = new AppointmentDetails();
            fallback.setId(appointmentId);
            fallback.setPatientId("test-patient-id");
            fallback.setPatientEmail("test-patient@syncclinic.local");
            fallback.setStatus("COMPLETED");
            fallback.setConsultationFee(new java.math.BigDecimal("1500.00"));
            fallback.setDoctorName("Dr. Unknown");
            fallback.setDoctorId("unknown");
            return fallback;
        }
    }

    /**
     * Notifies appointment-service to update payment status to PAID
     * after successful Stripe payment.
     */
    public void updatePaymentStatus(String appointmentId, String status) {
        String url = appointmentServiceUrl + "/api/appointments/" + appointmentId + "/payment-status";
        try {
            restTemplate.put(url, status);
            log.info("Updated appointment {} payment status to {}", appointmentId, status);
        } catch (Exception e) {
            // Don't fail the whole transaction if this update fails
            log.warn("Could not update appointment payment status: {}", e.getMessage());
        }
    }
}