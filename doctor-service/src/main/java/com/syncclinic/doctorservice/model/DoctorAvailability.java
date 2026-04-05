package com.syncclinic.doctorservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

// Marks this class as a database entity
@Entity

// Maps this entity to the "doctor_availability" table
@Table(name = "doctor_availability")

// Lombok annotations
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAvailability {

    // Primary key for the availability table
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many availability records can belong to one doctor
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    // Day of the week such as Monday, Tuesday, etc.
    private String dayOfWeek;

    // Doctor available start time
    private LocalTime startTime;

    // Doctor available end time
    private LocalTime endTime;
}