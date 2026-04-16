package com.syncclinic.doctorservice.service;

import com.syncclinic.doctorservice.model.Doctor;
import com.syncclinic.doctorservice.model.DoctorStatus;
import com.syncclinic.doctorservice.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

// Marks this class as a service layer component
@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    // Constructor injection for repository dependency
    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // Save a new doctor to the database
    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // Get all doctors from the database
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // Find verified doctors based on the patient's described situation.
    public List<Doctor> getRecommendedDoctors(String situation, String specialty) {
        Set<Doctor> recommended = new LinkedHashSet<>();

        if (specialty != null && !specialty.isBlank()) {
            recommended.addAll(
                    doctorRepository.findByStatusAndSpecialtyContainingIgnoreCase(
                            DoctorStatus.VERIFIED,
                            specialty.trim()
                    )
            );
        }

        String mappedSpecialty = mapSituationToSpecialty(situation);
        if (mappedSpecialty != null) {
            recommended.addAll(
                    doctorRepository.findByStatusAndSpecialtyContainingIgnoreCase(
                            DoctorStatus.VERIFIED,
                            mappedSpecialty
                    )
            );
        }

        if (recommended.isEmpty()) {
            return doctorRepository.findByStatus(DoctorStatus.VERIFIED);
        }

        return new ArrayList<>(recommended);
    }

    private String mapSituationToSpecialty(String situation) {
        if (situation == null || situation.isBlank()) {
            return null;
        }

        String normalized = situation.toLowerCase(Locale.ENGLISH);

        if (containsAny(normalized, "chest", "heart", "palpitation", "blood pressure")) {
            return "Cardio";
        }
        if (containsAny(normalized, "skin", "rash", "acne", "itch")) {
            return "Dermat";
        }
        if (containsAny(normalized, "stomach", "abdomen", "digestion", "gastric", "liver")) {
            return "Gastro";
        }
        if (containsAny(normalized, "headache", "migraine", "seizure", "nerv", "stroke")) {
            return "Neuro";
        }
        if (containsAny(normalized, "anxiety", "stress", "depression", "sleep", "panic")) {
            return "Psych";
        }
        if (containsAny(normalized, "joint", "bone", "back pain", "fracture", "arthritis")) {
            return "Ortho";
        }
        if (containsAny(normalized, "cough", "breath", "asthma", "lung", "respirat")) {
            return "Pulmo";
        }
        if (containsAny(normalized, "fever", "infection", "flu", "cold", "throat")) {
            return "General";
        }

        return null;
    }

    private boolean containsAny(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) {
                return true;
            }
        }
        return false;
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

        // Update doctor fields
        existingDoctor.setFullName(updatedDoctor.getFullName());
        existingDoctor.setEmail(updatedDoctor.getEmail());
        existingDoctor.setPhone(updatedDoctor.getPhone());
        existingDoctor.setSpecialty(updatedDoctor.getSpecialty());
        existingDoctor.setHospital(updatedDoctor.getHospital());
        existingDoctor.setQualification(updatedDoctor.getQualification());
        existingDoctor.setExperienceYears(updatedDoctor.getExperienceYears());
        existingDoctor.setBio(updatedDoctor.getBio());
        existingDoctor.setStatus(updatedDoctor.getStatus());

        // Save updated doctor
        return doctorRepository.save(existingDoctor);
    }

    // Delete a doctor by ID
    public void deleteDoctor(Long id) {

        // Check whether doctor exists
        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));

        // Delete doctor from database
        doctorRepository.delete(existingDoctor);
    }
}