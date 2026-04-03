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
}