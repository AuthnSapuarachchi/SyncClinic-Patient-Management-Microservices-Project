package com.SyncClinic.patient_service.controller;

<<<<<<< HEAD
import com.SyncClinic.patient_service.entity.Patient;
import com.SyncClinic.patient_service.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService service;

//    @PostMapping("/add")
//    public Patient addPatient(@RequestBody Patient patient) {
//        return service.savePatient(patient);
//    }

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

=======
public class PatientController {
>>>>>>> 5a20b6e (api gatway setup and set the security and service registry setup and register servicess in one phone book)
}
