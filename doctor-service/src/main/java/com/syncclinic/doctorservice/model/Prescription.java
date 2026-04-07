package com.syncclinic.doctorservice.model;

import jakarta.persistence.*;
import lombok.*;

// Marks this class as a database entity
@Entity

// Maps this entity to the "prescriptions" table
@Table(name = "prescriptions")

// Lombok annotations
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    // Primary key for prescription table
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Doctor who issued the prescription
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    // Patient ID from Patient Service
    private Long patientId;

    // Appointment ID from Appointment Service
    private Long appointmentId;

    // Diagnosis details
    @Column(length = 1000)
    private String diagnosis;

    // Prescribed medicines
    @Column(length = 1000)
    private String medicines;

    // Additional notes
    @Column(length = 1000)
    private String notes;
}