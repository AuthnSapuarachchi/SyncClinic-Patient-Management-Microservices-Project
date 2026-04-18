package com.syncclinic.doctorservice.repository;

import com.syncclinic.doctorservice.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Repository interface for DoctorAvailability entity
@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    void deleteByDoctorId(Long doctorId);
}
