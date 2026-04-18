package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.PaymentSuccessEvent;
import com.healthcare.notification.model.NotificationLog;
import com.healthcare.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentNotificationHandler {

    @Autowired
    private JavaMailSender mailSender;

    public void processPaymentReceipt(PaymentSuccessEvent event) {

        // Use the new data to build a highly detailed receipt
        String body = String.format(
                "Hello,\n\n" +
                        "Thank you for your payment! Your transaction was successful.\n\n" +
                        "📋 RECEIPT DETAILS:\n" +
                        "-----------------------------------\n" +
                        "Transaction ID: %s\n" +
                        "Appointment ID: %s\n" +
                        "Consultation: Dr. %s\n" +
                        "Amount Paid: %s %s\n" +
                        "Payment Method: %s\n" +
                        "-----------------------------------\n\n" +
                        "Your appointment is now fully CONFIRMED. Log in to your dashboard to view the meeting link.\n\n" +
                        "Best Regards,\n" +
                        "SyncClinic Billing Team",
                event.getPaymentId(),
                event.getAppointmentId(),
                event.getDoctorName(),
                event.getAmount(),
                event.getCurrency().toUpperCase(),
                event.getPaymentMethod()
        );

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("thilakarathnagayal@gmail.com"); // Your verified Brevo email
            message.setTo(event.getPatientEmail());
            message.setSubject("SyncClinic Payment Receipt - Confirmed");
            message.setText(body);

            mailSender.send(message);
            System.out.println("✅ Payment Receipt sent successfully to: " + event.getPatientEmail());

        } catch (Exception e) {
            System.err.println("❌ Failed to send receipt to " + event.getPatientEmail() + ". Error: " + e.getMessage());
        }
    }
}