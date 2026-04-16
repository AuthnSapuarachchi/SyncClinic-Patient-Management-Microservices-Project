package com.syncclinic.doctorservice.repository;

import com.syncclinic.doctorservice.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Repository interface for Doctor entity
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

}