package com.healthcare.telemedicine.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSessionRequest {

	private String appointmentId;
	private String patientId;
	private String patientName;
	private String doctorId;
	private String doctorName;

}
