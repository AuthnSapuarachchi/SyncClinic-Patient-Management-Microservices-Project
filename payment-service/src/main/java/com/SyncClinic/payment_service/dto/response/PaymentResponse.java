package com.SyncClinic.payment_service.dto.response;

import com.SyncClinic.payment_service.entity.Payment;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Data
@Builder
public class PaymentResponse {
 
    private String paymentId;
    private String appointmentId;
    private String doctorName;
    private BigDecimal amount;
    private String currency;
    private Payment.PaymentStatus status;
    private String clientSecret;   // Stripe client secret — frontend uses this to show the payment form
    private LocalDateTime createdAt;
    private String failureReason;
}