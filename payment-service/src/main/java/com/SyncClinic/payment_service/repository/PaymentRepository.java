package com.SyncClinic.payment_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.SyncClinic.payment_service.entity.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    List<Payment> findByPatientIdOrderByCreatedAtDesc(String patientId);

    List<Payment> findByAppointmentId(String appointmentId);

    // Get most recent payment for an appointment (used by GET /:appointmentId)
    Optional<Payment> findTopByAppointmentIdOrderByCreatedAtDesc(String appointmentId);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    Page<Payment> findAll(Pageable pageable);
}