package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.AppointmentBookedEvent;
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
public class AppointmentNotificationHandler {

    private final JavaMailSender mailSender;
    private final NotificationLogRepository logRepository;

    public void handle(AppointmentBookedEvent event) {
        String dummyPatientEmail = "patient_" + event.getPatientId() + "@dummy.com";
        String messageBody = String.format("Dear Patient, your appointment %s with Doctor %s is confirmed for %s.",
                event.getAppointmentId(), event.getDoctorId(), event.getAppointmentDateTime());

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(dummyPatientEmail);
            email.setSubject("Appointment Confirmed");
            email.setText(messageBody);
            
            mailSender.send(email);
            log.info("Email sent successfully to {}", dummyPatientEmail);
            
            saveLog(event.getPatientId(), dummyPatientEmail, messageBody, "SUCCESS");
        } catch (Exception e) {
            log.error("Failed to send email to {}", dummyPatientEmail, e);
            saveLog(event.getPatientId(), dummyPatientEmail, messageBody, "FAILED");
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
