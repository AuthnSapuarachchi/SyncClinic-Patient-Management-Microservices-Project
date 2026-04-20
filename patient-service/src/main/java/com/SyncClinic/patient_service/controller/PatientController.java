package com.SyncClinic.patient_service.controller;

import com.SyncClinic.patient_service.dto.PatientUpdateRequest;
import com.SyncClinic.patient_service.entity.Patient;
import com.SyncClinic.patient_service.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService service;

    // We use PUT because we are updating an existing row, not creating a new one!
    @PutMapping("/update/{email}")
    public Patient updateProfile(@PathVariable String email, @Valid @RequestBody PatientUpdateRequest patientData) {
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

    @GetMapping("/internal/{id}/email")
    public Map<String, Object> getPatientEmailById(@PathVariable Long id) {
        Patient patient = service.getPatientById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("id", patient.getId());
        response.put("email", patient.getEmail());
        return response;
    }

    @GetMapping("/profile/{email:.+}")
    public Patient getPatientProfile(@PathVariable String email) {
        return service.getPatientByEmail(email);
    }

    @PostMapping("/{email}/report")
    public ResponseEntity<Map<String, String>> uploadMedicalReport(
            @PathVariable String email,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadMedicalReport(email, file));
    }

}
