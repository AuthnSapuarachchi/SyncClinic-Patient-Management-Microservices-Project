package com.syncclinic.appointmentservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

// Marks this class as a database entity
@Entity

// Maps this entity to the "appointments" table
@Table(name = "appointments")

// Lombok annotations
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    // Primary key for appointment table
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Patient ID from Patient Service
    private Long patientId;

    // Doctor ID from Doctor Service
    private Long doctorId;

    // Appointment date
    private LocalDate appointmentDate;

    // Appointment start time
    private LocalTime appointmentTime;

    // Reason for appointment
    @Column(length = 1000)
    private String reason;

    // Appointment status
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
}