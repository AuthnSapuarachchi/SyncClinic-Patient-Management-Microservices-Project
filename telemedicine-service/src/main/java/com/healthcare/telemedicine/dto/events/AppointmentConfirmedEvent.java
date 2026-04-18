package com.healthcare.telemedicine.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentConfirmedEvent {

	private String appointmentId;
	private String patientId;
	private String patientName;
	private String doctorId;
	private String doctorName;
	private String scheduledAt;

}
