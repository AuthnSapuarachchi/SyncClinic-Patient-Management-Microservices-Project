package com.syncclinic.doctorservice.controller;

import com.syncclinic.doctorservice.model.Prescription;
import com.syncclinic.doctorservice.service.PrescriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST controller for prescription APIs
@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    // Create a prescription for a doctor
    @PostMapping("/doctor/{doctorId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Prescription createPrescription(
            @PathVariable Long doctorId,
            @RequestBody Prescription prescription
    ) {
        return prescriptionService.createPrescription(doctorId, prescription);
    }

    // Get all prescriptions for a patient
    @GetMapping("/patient/{patientId}")
    public List<Prescription> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return prescriptionService.getPrescriptionsByPatient(patientId);
    }
}