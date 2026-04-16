package com.SyncClinic.patient_service.service;

import com.SyncClinic.patient_service.dto.PatientUpdateRequest;
import com.SyncClinic.patient_service.entity.Patient;
import com.SyncClinic.patient_service.exception.ResourceNotFoundException;
import com.SyncClinic.patient_service.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PatientService {

    @Autowired
    private PatientRepository repository;

    // 1. The Update Method (Triggered by REST API)
    public Patient updatePatientProfile(String email, PatientUpdateRequest updatedData) {
        Patient existingPatient = repository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for email: " + email));

        existingPatient.setFirstName(updatedData.getFirstName());
        existingPatient.setLastName(updatedData.getLastName());
        existingPatient.setPhone(updatedData.getPhone());
        existingPatient.setDateOfBirth(updatedData.getDateOfBirth() != null ? updatedData.getDateOfBirth().toString() : null);
        existingPatient.setBloodGroup(updatedData.getBloodGroup());
        existingPatient.setMedicalHistory(updatedData.getMedicalHistory());

        return repository.save(existingPatient);
    }

    // 2. The Get All Method
    public List<Patient> getAllPatients() {
        return repository.findAll();
    }

    // 3. The Get By ID Method
    public Patient getPatientById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    public Patient getPatientByEmail(String email) {
        // Throw domain exception so global exception handler can format a consistent 404 response.
        return repository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for email: " + email));
    }

    public Map<String, String> uploadMedicalReport(String email, MultipartFile file) {
        repository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for email: " + email));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file to upload.");
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";

        if (originalFileName != null) {
            int extensionIndex = originalFileName.lastIndexOf('.');
            if (extensionIndex >= 0) {
                fileExtension = originalFileName.substring(extensionIndex);
            }
        }

        String uniqueFileName = email + "_" + UUID.randomUUID() + fileExtension;

        try {
            Path uploadDirectory = Paths.get("uploads").toAbsolutePath().normalize();
            Files.createDirectories(uploadDirectory);

            Path targetLocation = uploadDirectory.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return Map.of(
                    "message", "Report uploaded successfully!",
                    "fileName", uniqueFileName
            );
        } catch (IOException e) {
            throw new RuntimeException("Could not upload the file: " + e.getMessage(), e);
        }
    }

}
