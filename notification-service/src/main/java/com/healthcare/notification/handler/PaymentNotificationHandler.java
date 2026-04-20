package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.PaymentInitiatedEvent;
import com.healthcare.notification.dto.events.PaymentSuccessEvent;
import com.healthcare.notification.model.NotificationLog;
import com.healthcare.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentNotificationHandler {

    private final JavaMailSender mailSender;
    private final NotificationLogRepository logRepository;

    @Value("${notification.mail.from}")
    private String mailFrom;

    public void handlePaymentInitiated(PaymentInitiatedEvent event) {
        String recipientEmail = event.getPatientEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Skipping payment initiated email because patient email is missing for appointmentId={}", event.getAppointmentId());
            return;
        }

        String amount = event.getAmount() != null ? event.getAmount() : "0";
        String currency = event.getCurrency() != null ? event.getCurrency().toUpperCase() : "LKR";
        String messageBody = String.format(
                "Dear Patient,%n%nYour payment process has started for appointment %s.%nAmount: %s %s%nDoctor: %s%nStarted at: %s%n%nPlease complete the checkout to confirm your payment.%n%nThank you for choosing SyncClinic.",
                event.getAppointmentId(),
                amount,
                currency,
                event.getDoctorName() != null ? event.getDoctorName() : "Doctor",
                event.getInitiatedAt() != null ? event.getInitiatedAt() : LocalDateTime.now().toString()
        );

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(mailFrom);
            email.setTo(recipientEmail);
            email.setSubject("Payment Started - SyncClinic");
            email.setText(messageBody);

            mailSender.send(email);
            log.info("Payment initiated email sent successfully to {}", recipientEmail);

            saveLog(event.getPatientId(), recipientEmail, messageBody, "SUCCESS");
        } catch (Exception e) {
            log.error("Failed to send payment initiated email to {}", recipientEmail, e);
            saveLog(event.getPatientId(), recipientEmail, messageBody, "FAILED");
        }
    }

    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        String recipientEmail = event.getPatientEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Skipping payment success email because patient email is missing for paymentId={}", event.getPaymentId());
            return;
        }

        String amount = event.getAmount() != null ? event.getAmount() : "0";
        String currency = event.getCurrency() != null ? event.getCurrency().toUpperCase() : "LKR";
        String messageBody = String.format(
                "Dear Patient,%n%nYour payment for appointment %s has been successfully completed.%nAmount: %s %s%nPayment method: %s%nPaid at: %s%n%nThank you for choosing SyncClinic.",
                event.getAppointmentId(),
                amount,
                currency,
                event.getPaymentMethod() != null ? event.getPaymentMethod() : "Card",
                event.getPaidAt() != null ? event.getPaidAt() : LocalDateTime.now().toString()
        );

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(mailFrom);
            email.setTo(recipientEmail);
            email.setSubject("Payment Successful - SyncClinic");
            email.setText(messageBody);

            mailSender.send(email);
            log.info("Payment success email sent successfully to {}", recipientEmail);

            saveLog(event.getPatientId(), recipientEmail, messageBody, "SUCCESS");
        } catch (Exception e) {
            log.error("Failed to send payment success email to {}", recipientEmail, e);
            saveLog(event.getPatientId(), recipientEmail, messageBody, "FAILED");
        }
    }

    private void saveLog(String recipientId, String email, String message, String status) {
        NotificationLog nLog = new NotificationLog();
        nLog.setRecipientId(recipientId);
        nLog.setRecipientEmail(email);
        nLog.setMessage(message);
        nLog.setStatus(status);
        nLog.setSentAt(LocalDateTime.now());
        logRepository.save(nLog);
    }
}