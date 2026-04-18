package com.healthcare.notification.dto.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentBookedEvent {
    private String patientEmail;
    private String doctorName;
    private String appointmentDate;
    private String appointmentTime;
}
