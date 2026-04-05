package com.syncclinic.doctorservice.controller;

import com.syncclinic.doctorservice.model.DoctorAvailability;
import com.syncclinic.doctorservice.service.DoctorAvailabilityService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST controller for doctor availability APIs
@RestController
@RequestMapping("/api/doctors/{doctorId}/availability")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    public DoctorAvailabilityController(DoctorAvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    // Add a new availability slot for a doctor
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DoctorAvailability addAvailability(
            @PathVariable Long doctorId,
            @RequestBody DoctorAvailability availability
    ) {
        return availabilityService.addAvailability(doctorId, availability);
    }

    // Get all availability slots for a doctor
    @GetMapping
    public List<DoctorAvailability> getAvailabilityByDoctor(@PathVariable Long doctorId) {
        return availabilityService.getAvailabilityByDoctor(doctorId);
    }
}