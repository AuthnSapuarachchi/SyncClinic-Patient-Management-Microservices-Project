package com.syncclinic.doctorservice.service;

import com.syncclinic.doctorservice.model.Doctor;
import com.syncclinic.doctorservice.model.DoctorAvailability;
import com.syncclinic.doctorservice.repository.DoctorAvailabilityRepository;
import com.syncclinic.doctorservice.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// Service layer for doctor availability operations
@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailabilityService(
            DoctorAvailabilityRepository availabilityRepository,
            DoctorRepository doctorRepository
    ) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
    }

    // Add a new availability record for a doctor
    public DoctorAvailability addAvailability(Long doctorId, DoctorAvailability availability) {

        // Find the doctor first
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        // Assign doctor to availability record
        availability.setDoctor(doctor);

        // Save availability
        return availabilityRepository.save(availability);
    }

    // Get all availability records for a doctor
    public List<DoctorAvailability> getAvailabilityByDoctor(Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        return doctor.getId() != null
                ? availabilityRepository.findAll().stream()
                    .filter(a -> a.getDoctor().getId().equals(doctorId))
                    .toList()
                : List.of();
    }
}