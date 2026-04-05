package com.SyncClinic.patient_service.repository;

<<<<<<< HEAD
import com.SyncClinic.patient_service.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
=======
public interface PatientRepository {
>>>>>>> 5a20b6e (api gatway setup and set the security and service registry setup and register servicess in one phone book)
}
