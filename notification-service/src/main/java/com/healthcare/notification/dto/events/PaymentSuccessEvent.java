package com.healthcare.notification.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSuccessEvent {

	private String paymentId;
	private String patientId;
	private String patientName;
	private String patientEmail;
	private String patientPhone;
	private String doctorId;
	private String doctorName;
	private String amount;
	private String currency;
	private String paymentMethod;

}
