package com.syncclinic.appointmentservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// Entity to keep a timeline of appointment status changes.
@Entity
@Table(name = "appointment_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus oldStatus;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus newStatus;

    private LocalDateTime changedAt;
}
