package com.SyncClinic.payment_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
 
@Data
public class CreatePaymentRequest {
 
    @NotBlank(message = "Appointment ID is required")
    private String appointmentId;
 
    @NotBlank(message = "Doctor ID is required")
    private String doctorId;
 
    @NotBlank(message = "Doctor name is required")
    private String doctorName;
 
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.50", message = "Minimum payment is $0.50")
    private BigDecimal amount;
 
    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^[a-z]{3}$", message = "Currency must be a 3-letter code e.g. usd")
    private String currency;
}
 