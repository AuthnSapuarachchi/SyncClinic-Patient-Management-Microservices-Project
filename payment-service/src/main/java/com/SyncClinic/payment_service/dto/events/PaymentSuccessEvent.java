package com.SyncClinic.payment_service.dto.events;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
/**
 * Published to Kafka topic "payment-success-events".
 * The notification-service listens to this and sends
 * confirmation SMS/email to patient and doctor.
 */
@Data
@Builder
public class PaymentSuccessEvent {
 
    private String paymentId;
    private String appointmentId;
    private String patientId;
    private String patientEmail;
    private String doctorId;
    private String doctorName;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime paidAt;
}
 