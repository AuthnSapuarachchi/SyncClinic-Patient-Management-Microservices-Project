package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.PaymentSuccessEvent;
import com.healthcare.notification.model.NotificationLog;
import com.healthcare.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
                event.getPaidAt() != null ? event.getPaidAt() : LocalDateTime.now()
        );

        try {
            SimpleMailMessage email = new SimpleMailMessage();
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