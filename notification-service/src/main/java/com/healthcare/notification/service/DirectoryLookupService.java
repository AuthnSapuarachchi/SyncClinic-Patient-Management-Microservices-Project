package com.healthcare.notification.service;

import com.healthcare.notification.dto.directory.DoctorDirectoryResponse;
import com.healthcare.notification.dto.directory.PatientDirectoryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class DirectoryLookupService {

	private final RestTemplate restTemplate = new RestTemplate();

	@Value("${services.patient-service-url:http://syncclinic-patient:8082}")
	private String patientServiceUrl;

	@Value("${services.doctor-service-url:http://syncclinic-doctor:8083}")
	private String doctorServiceUrl;

	public PatientDirectoryResponse getPatient(Long patientId) {
		try {
			return restTemplate.getForObject(patientServiceUrl + "/api/patients/" + patientId,
					PatientDirectoryResponse.class);
		} catch (Exception e) {
			log.error("Failed to load patient details for id: {}", patientId, e);
			throw new RuntimeException("Failed to load patient details", e);
		}
	}

	public DoctorDirectoryResponse getDoctor(Long doctorId) {
		try {
			return restTemplate.getForObject(doctorServiceUrl + "/api/doctors/" + doctorId,
					DoctorDirectoryResponse.class);
		} catch (Exception e) {
			log.error("Failed to load doctor details for id: {}", doctorId, e);
			throw new RuntimeException("Failed to load doctor details", e);
		}
	}
}