package com.syncclinic.doctorservice.repository;

import com.syncclinic.doctorservice.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Repository interface for Prescription entity
@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    // Get all prescriptions for a specific patient
    List<Prescription> findByPatientId(Long patientId);

    List<Prescription> findByDoctorId(Long doctorId);

    void deleteByDoctorId(Long doctorId);
}
