package com.syncclinic.doctorservice.repository;

import com.syncclinic.doctorservice.model.Doctor;
import com.syncclinic.doctorservice.model.DoctorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Repository interface for Doctor entity
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

	List<Doctor> findByStatus(DoctorStatus status);

	List<Doctor> findByStatusAndSpecialtyContainingIgnoreCase(DoctorStatus status, String specialty);

}