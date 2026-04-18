package com.SyncClinic.payment_service.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentSuccessEvent {

    private String paymentId;
    private String appointmentId;
    private String patientId;
    private String patientEmail;
    private String doctorId;
    private String doctorName;
    private String amount;
    private String currency;
    private String timestamp; // Jackson will safely parse the LocalDateTime to a String
    private String paymentMethod;
}
 