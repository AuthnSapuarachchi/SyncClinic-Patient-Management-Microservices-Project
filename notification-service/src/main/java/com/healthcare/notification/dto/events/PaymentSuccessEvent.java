package com.healthcare.notification.dto.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
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