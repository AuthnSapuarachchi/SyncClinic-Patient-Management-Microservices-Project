package com.SyncClinic.patient_service.controller;

import com.SyncClinic.patient_service.entity.Patient;
import com.SyncClinic.patient_service.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService service;

    // We use PUT because we are updating an existing row, not creating a new one!
    @PutMapping("/update/{email}")
    public Patient updateProfile(@PathVariable String email, @RequestBody Patient patientData) {
        return service.updatePatientProfile(email, patientData);
    }

    @GetMapping("/all")
    public List<Patient> getAllPatients() {
        return service.getAllPatients();
    }

    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return service.getPatientById(id);
    }

}
