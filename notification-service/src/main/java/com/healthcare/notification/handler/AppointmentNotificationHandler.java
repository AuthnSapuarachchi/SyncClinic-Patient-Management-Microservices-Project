package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.AppointmentBookedEvent;
import com.healthcare.notification.model.NotificationLog;
import com.healthcare.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentNotificationHandler {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private NotificationLogRepository logRepository;

    public void processAppointmentEmail(AppointmentBookedEvent event) {
        String body = String.format(
                "Hello! Your appointment with %s on %s at %s is confirmed.",
                event.getDoctorName(), event.getAppointmentDate(), event.getAppointmentTime()
        );

        try {
            // 1. Send the Email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(event.getPatientEmail());
            message.setSubject("SyncClinic Appointment Confirmed");
            message.setText(body);
            mailSender.send(message);

            System.out.println("✅ Email sent successfully to: " + event.getPatientEmail());

            // 2. Save Success Log to MongoDB
            saveLog(event.getPatientEmail(), body, "SENT");

        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
            // Save Failure Log to MongoDB
            saveLog(event.getPatientEmail(), body, "FAILED");
        }
    }

    private void saveLog(String email, String body, String status) {
        NotificationLog log = NotificationLog.builder()
                .recipientEmail(email)
                .messageBody(body)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
        logRepository.save(log);
    }
}
