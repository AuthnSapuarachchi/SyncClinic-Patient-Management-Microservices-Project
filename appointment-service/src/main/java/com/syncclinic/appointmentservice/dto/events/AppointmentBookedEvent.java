package com.syncclinic.appointmentservice.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentBookedEvent {
    private String appointmentId;
    private String patientEmail;
    private String doctorName;
    private String appointmentDate;
    private String appointmentTime;
}