package com.SyncClinic.payment_service.dto.events;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
 
/**
 * Published to Kafka topic "payment-failed-events".
 * Notification-service listens to this to inform
 * the patient that their payment was unsuccessful.
 */
@Data
@Builder
public class PaymentFailedEvent {
 
    private String paymentId;
    private String appointmentId;
    private String patientId;
    private String patientEmail;
    private String failureReason;
    private LocalDateTime failedAt;
}
 