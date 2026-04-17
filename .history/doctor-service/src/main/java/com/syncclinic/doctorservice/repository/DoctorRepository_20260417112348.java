package com.syncclinic.doctorservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.syncclinic.doctorservice.model.Doctor;

// Repository interface for Doctor entity
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

   @Query("SELECT d FROM Doctor d WHERE d.status = 'VERIFIED' " + // CRITICAL: Security check
           "AND (:specialty IS NULL OR :specialty = '' OR LOWER(d.specialty) = LOWER(:specialty)) " +
           "AND (:situation IS NULL OR :situation = '' OR " +
           "LOWER(d.specialty) LIKE LOWER(CONCAT('%', :situation, '%')) OR " + // Search specialty
           "LOWER(d.bio) LIKE LOWER(CONCAT('%', :situation, '%')))")          // AND search bio
    List<Doctor> findAvailableDoctors(@Param("situation") String situation, @Param("specialty") String specialty);
}