package com.SyncClinic.patient_service.service;

import com.SyncClinic.patient_service.dto.PatientUpdateRequest;
import com.SyncClinic.patient_service.entity.Patient;
import com.SyncClinic.patient_service.exception.ResourceNotFoundException;
import com.SyncClinic.patient_service.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
        existingPatient.setDateOfBirth(updatedData.getDateOfBirth().toString());
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
}
