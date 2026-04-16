package com.syncclinic.doctorservice.controller;

import com.syncclinic.doctorservice.model.Doctor;
import com.syncclinic.doctorservice.service.DoctorService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Marks this class as a REST API controller
@RestController

// Base URL for all doctor-related APIs
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    // Constructor injection for service dependency
    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // Create a new doctor
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.createDoctor(doctor);
    }

    // Get all doctors
    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/available")
    public List<Doctor> getAvailableDoctors(
            @RequestParam(required = false) String situation,
            @RequestParam(required = false) String specialty
    ) {
        return doctorService.getRecommendedDoctors(situation, specialty);
    }

    // Get a doctor by ID
    @GetMapping("/{id}")
    public Doctor getDoctorById(@PathVariable Long id) {
        return doctorService.getDoctorById(id);
    }

    // Update an existing doctor
    @PutMapping("/{id}")
    public Doctor updateDoctor(@PathVariable Long id, @RequestBody Doctor updatedDoctor) {
        return doctorService.updateDoctor(id, updatedDoctor);
    }

    // Delete a doctor by ID
    @DeleteMapping("/{id}")
    public String deleteDoctor(@PathVariable Long id) {

        doctorService.deleteDoctor(id);

        return "Doctor deleted successfully";
    }
}