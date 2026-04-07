package com.syncclinic.doctorservice.service;

import com.syncclinic.doctorservice.model.Doctor;
import com.syncclinic.doctorservice.model.Prescription;
import com.syncclinic.doctorservice.repository.DoctorRepository;
import com.syncclinic.doctorservice.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// Service layer for prescription operations
@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            DoctorRepository doctorRepository
    ) {
        this.prescriptionRepository = prescriptionRepository;
        this.doctorRepository = doctorRepository;
    }

    // Create a prescription for a doctor
    public Prescription createPrescription(Long doctorId, Prescription prescription) {

        // Find doctor by ID
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        // Assign doctor to prescription
        prescription.setDoctor(doctor);

        // Save prescription
        return prescriptionRepository.save(prescription);
    }

    // Get all prescriptions for a patient
    public List<Prescription> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }
}