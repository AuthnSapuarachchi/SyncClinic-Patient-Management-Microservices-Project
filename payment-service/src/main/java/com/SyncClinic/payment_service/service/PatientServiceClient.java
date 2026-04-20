package com.SyncClinic.payment_service.service;

import com.SyncClinic.payment_service.dto.response.PatientDirectoryResponse;
import com.SyncClinic.payment_service.exception.PaymentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PatientServiceClient {

    private static final Logger log = LoggerFactory.getLogger(PatientServiceClient.class);

    private final RestTemplate restTemplate;

    @Value("${patient.service.url}")
    private String patientServiceUrl;

    public PatientServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    public String getPatientEmail(String patientId) {
        String url = patientServiceUrl + "/api/patients/internal/" + patientId + "/email";

        try {
            PatientDirectoryResponse patient = restTemplate.getForObject(url, PatientDirectoryResponse.class);
            if (patient == null || patient.getEmail() == null || patient.getEmail().isBlank()) {
                throw new PaymentException("Patient email not found for patientId: " + patientId);
            }
            return patient.getEmail();
        } catch (PaymentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch patient email from {}: {}", url, e.getMessage());
            throw new PaymentException("Could not resolve patient email for payment notification.");
        }
    }
}
