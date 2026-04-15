package com.syncclinic.appointmentservice.repository;

import com.syncclinic.appointmentservice.model.Appointment;
import com.syncclinic.appointmentservice.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Repository interface for Appointment entity
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Get appointments by patient ID
    List<Appointment> findByPatientId(Long patientId);

    // Get appointments by doctor ID
    List<Appointment> findByDoctorId(Long doctorId);

    // Get appointments by status
    List<Appointment> findByStatus(AppointmentStatus status);

    // Search appointments by doctor and status
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    // Search appointments by patient and status
    List<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status);
}