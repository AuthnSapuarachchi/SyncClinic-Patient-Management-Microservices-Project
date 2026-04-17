package com.syncclinic.doctorservice.repository;

import com.syncclinic.doctorservice.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

// Repository interface for Doctor entity
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("SELECT d FROM Doctor d WHERE " +
           "(:specialty IS NULL OR LOWER(d.specialty) LIKE LOWER(CONCAT('%', :specialty, '%'))) AND " +
           "(:situation IS NULL OR LOWER(d.bio) LIKE LOWER(CONCAT('%', :situation, '%')))")
    List<Doctor> findAvailableDoctors(@Param("situation") String situation, @Param("specialty") String specialty);
}