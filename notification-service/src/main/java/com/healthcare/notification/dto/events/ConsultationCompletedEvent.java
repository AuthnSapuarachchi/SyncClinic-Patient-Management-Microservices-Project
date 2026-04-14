package com.healthcare.notification.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationCompletedEvent {

	private String appointmentId;
	private String patientName;
	private String patientEmail;
	private String patientPhone;
	private String doctorName;
	private String doctorEmail;
	private Long sessionDuration;
	private String prescriptionUrl;

}
