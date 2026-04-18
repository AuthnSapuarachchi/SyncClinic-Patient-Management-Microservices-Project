package com.syncclinic.doctorservice.service;

import com.syncclinic.doctorservice.model.Doctor;
import com.syncclinic.doctorservice.repository.DoctorAvailabilityRepository;
import com.syncclinic.doctorservice.repository.DoctorRepository;
import com.syncclinic.doctorservice.repository.PrescriptionRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

// Marks this class as a service layer component
@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final PrescriptionRepository prescriptionRepository;

    // Constructor injection for repository dependency
    public DoctorService(
            DoctorRepository doctorRepository,
            DoctorAvailabilityRepository doctorAvailabilityRepository,
            PrescriptionRepository prescriptionRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    // Save a new doctor to the database
    public Doctor createDoctor(Doctor doctor) {
        normalizeDoctorEmail(doctor);

        if (doctor.getEmail() != null && !doctor.getEmail().isBlank()) {
            return doctorRepository.findByEmailIgnoreCase(doctor.getEmail())
                    .map(existingDoctor -> updateDoctorFields(existingDoctor, doctor, false))
                    .map(doctorRepository::save)
                    .orElseGet(() -> doctorRepository.save(doctor));
        }

        return doctorRepository.save(doctor);
    }

    // Get all doctors from the database
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // Get available doctors from the database
    public List<Doctor> getAvailableDoctors(String situation, String specialty) {
        return doctorRepository.findAvailableDoctors(situation, specialty);
    }

    // Get a doctor by ID
    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));
    }

    // Update doctor details
    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {

        // Find existing doctor
        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));

        normalizeDoctorEmail(updatedDoctor);

        if (updatedDoctor.getEmail() != null && !updatedDoctor.getEmail().isBlank()) {
            doctorRepository.findByEmailIgnoreCase(updatedDoctor.getEmail())
                    .filter(doctorWithEmail -> !doctorWithEmail.getId().equals(id))
                    .ifPresent(doctorWithEmail -> {
                        throw new RuntimeException("Doctor profile already exists for email: " + updatedDoctor.getEmail());
                    });
        }

        updateDoctorFields(existingDoctor, updatedDoctor, true);

        // Save updated doctor
        return doctorRepository.save(existingDoctor);
    }

    // Delete a doctor by ID
    @Transactional
    public void deleteDoctor(Long id) {

        // Check whether doctor exists
        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));

        // Delete doctor-owned records first so foreign keys do not block admin cleanup.
        doctorAvailabilityRepository.deleteByDoctorId(id);
        prescriptionRepository.deleteByDoctorId(id);

        // Delete doctor from database.
        doctorRepository.delete(existingDoctor);
    }

    private Doctor updateDoctorFields(Doctor existingDoctor, Doctor updatedDoctor, boolean allowStatusUpdate) {
        existingDoctor.setFullName(updatedDoctor.getFullName());
        existingDoctor.setEmail(updatedDoctor.getEmail());
        existingDoctor.setPhone(updatedDoctor.getPhone());
        existingDoctor.setSpecialty(updatedDoctor.getSpecialty());
        existingDoctor.setHospital(updatedDoctor.getHospital());
        existingDoctor.setQualification(updatedDoctor.getQualification());
        existingDoctor.setExperienceYears(updatedDoctor.getExperienceYears());
        existingDoctor.setBio(updatedDoctor.getBio());

        if (allowStatusUpdate || existingDoctor.getStatus() == null) {
            existingDoctor.setStatus(updatedDoctor.getStatus());
        }

        return existingDoctor;
    }

    private void normalizeDoctorEmail(Doctor doctor) {
        if (doctor.getEmail() != null) {
            doctor.setEmail(doctor.getEmail().trim().toLowerCase());
        }
    }
}
