package com.syncclinic.doctorservice.service;

import com.syncclinic.doctorservice.model.Doctor;
import com.syncclinic.doctorservice.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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