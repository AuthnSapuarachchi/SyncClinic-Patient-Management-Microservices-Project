import os

files = {
    'src/main/java/com/healthcare/notification/config/RabbitMQConfig.java': '''package com.healthcare.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_APPOINTMENT_BOOKED = "queue.appointment.booked";
    public static final String EXCHANGE_HEALTHCARE = "healthcare.exchange";
    public static final String ROUTING_KEY_APPOINTMENT_BOOKED = "appointment.booked";

    @Bean
    public Queue appointmentBookedQueue() {
        return new Queue(QUEUE_APPOINTMENT_BOOKED, true);
    }

    @Bean
    public TopicExchange healthcareExchange() {
        return new TopicExchange(EXCHANGE_HEALTHCARE);
    }

    @Bean
    public Binding appointmentBookedBinding(Queue appointmentBookedQueue, TopicExchange healthcareExchange) {
        return BindingBuilder.bind(appointmentBookedQueue).to(healthcareExchange).with(ROUTING_KEY_APPOINTMENT_BOOKED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
''',
    'src/main/java/com/healthcare/notification/model/NotificationLog.java': '''package com.healthcare.notification.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "notification_logs")
public class NotificationLog {

    @Id
    private String id;
    private String recipientId;
    private String recipientEmail;
    private String message;
    private String status; // SUCCESS or FAILED
    private LocalDateTime sentAt;
}
''',
    'src/main/java/com/healthcare/notification/dto/events/AppointmentBookedEvent.java': '''package com.healthcare.notification.dto.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentBookedEvent {
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private LocalDateTime appointmentDateTime;
}
''',
    'src/main/java/com/healthcare/notification/repository/NotificationLogRepository.java': '''package com.healthcare.notification.repository;

import com.healthcare.notification.model.NotificationLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationLogRepository extends MongoRepository<NotificationLog, String> {
}
''',
    'src/main/java/com/healthcare/notification/consumer/NotificationConsumer.java': '''package com.healthcare.notification.consumer;

import com.healthcare.notification.config.RabbitMQConfig;
import com.healthcare.notification.dto.events.AppointmentBookedEvent;
import com.healthcare.notification.handler.AppointmentNotificationHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final AppointmentNotificationHandler notificationHandler;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_APPOINTMENT_BOOKED)
    public void handleAppointmentBooked(AppointmentBookedEvent event) {
        log.info("Received AppointmentBookedEvent for appointmentId: {}", event.getAppointmentId());
        notificationHandler.handle(event);
    }
}
''',
    'src/main/java/com/healthcare/notification/handler/AppointmentNotificationHandler.java': '''package com.healthcare.notification.handler;

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
'''
}

for path, content in files.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Done writing files.")
