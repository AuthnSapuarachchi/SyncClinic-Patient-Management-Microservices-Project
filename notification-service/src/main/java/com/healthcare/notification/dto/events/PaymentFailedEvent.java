package com.healthcare.notification.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentFailedEvent {

	private String patientName;
	private String patientEmail;
	private String patientPhone;
	private String amount;
	private String currency;
	private String failureReason;

}
