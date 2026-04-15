package com.SyncClinic.payment_service.entity;

 
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
 
    // Who is paying
    @Column(nullable = false)
    private String patientId;
 
    @Column(nullable = false)
    private String patientEmail;
 
    // What they're paying for
    @Column(nullable = false)
    private String appointmentId;
 
    @Column(nullable = false)
    private String doctorId;
 
    @Column(nullable = false)
    private String doctorName;
 
    // Payment details
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
 
    @Column(nullable = false)
    private String currency; // "usd"
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;
 
    // Stripe references
    @Column(unique = true)
    private String stripePaymentIntentId;
 
    @Column(unique = true)
    private String stripeClientSecret; // sent to frontend to complete payment
 
    // Timestamps
    @Column(nullable = false)
    private LocalDateTime createdAt;
 
    private LocalDateTime updatedAt;
 
    // Optional: reason if failed
    private String failureReason;
 
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
 
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
 
    public enum PaymentStatus {
        PENDING,      // PaymentIntent created, waiting for card details
        SUCCEEDED,    // Stripe confirmed payment
        FAILED,       // Payment declined or errored
        REFUNDED,     // Payment was refunded
        CANCELLED     // Cancelled before completion
    }
}