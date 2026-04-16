package com.syncclinic.appointmentservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// Entity to store appointment status change history
@Entity
@Table(name = "appointment_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentStatusHistory {

    // Primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Related appointment
    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    // Old appointment status
    @Enumerated(EnumType.STRING)
    private AppointmentStatus oldStatus;

    // New appointment status
    @Enumerated(EnumType.STRING)
    private AppointmentStatus newStatus;

    // Time of status change
    private LocalDateTime changedAt;
}