package com.healthcare.notification.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentBookedEvent {

	private String appointmentId;
	private String patientId;
	private String doctorId;
	private String patientName;
	private String patientEmail;
	private String patientPhone;
	private String doctorName;
	private String doctorEmail;
	private String doctorPhone;
	private String appointmentDate;
	private String appointmentTime;
	private String specialty;

}
