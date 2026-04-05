package com.syncclinic.doctorservice.model;

import jakarta.persistence.*;
import lombok.*;

// Marks this class as a database entity
@Entity

// Maps this entity to the "doctors" table
@Table(name = "doctors")

// Lombok annotations to reduce boilerplate code
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    // Primary key for the doctor table
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Doctor full name
    private String fullName;

    // Doctor email must be unique
    @Column(unique = true)
    private String email;

    // Contact number
    private String phone;

    // Doctor specialty such as Cardiologist, Dentist, etc.
    private String specialty;

    // Hospital or clinic name
    private String hospital;

    // Educational qualifications
    private String qualification;

    // Total years of experience
    private Integer experienceYears;

    // Short doctor biography or description
    @Column(length = 1000)
    private String bio;

    // Verification status of the doctor
    @Enumerated(EnumType.STRING)
    private DoctorStatus status;
}