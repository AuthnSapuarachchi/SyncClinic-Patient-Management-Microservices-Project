package com.SyncClinic.patient_service.service;

<<<<<<< HEAD
import com.SyncClinic.patient_service.entity.Patient;
import com.SyncClinic.patient_service.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository repository;

//    public Patient savePatient(Patient patient) {
//        return repository.save(patient);
//    }


    // 2. ADD the new Update method
    public Patient updatePatientProfile(String email, Patient updatedData) {
        // Step A: Find the blank profile Kafka created
        Patient existingPatient = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient profile not found for email: " + email));

        // Step B: Overwrite the pending/null data with the new data
        existingPatient.setFirstName(updatedData.getFirstName());
        existingPatient.setLastName(updatedData.getLastName());
        existingPatient.setPhone(updatedData.getPhone());
        existingPatient.setDateOfBirth(updatedData.getDateOfBirth());
        existingPatient.setBloodGroup(updatedData.getBloodGroup());
        existingPatient.setMedicalHistory(updatedData.getMedicalHistory());

        // Step C: Save the updated profile back to the database
        return repository.save(existingPatient);
    }

    public List<Patient> getAllPatients() {
        return repository.findAll();
    }

    public Patient getPatientById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
    }
=======
public class PatientService {
>>>>>>> 5a20b6e (api gatway setup and set the security and service registry setup and register servicess in one phone book)
}
