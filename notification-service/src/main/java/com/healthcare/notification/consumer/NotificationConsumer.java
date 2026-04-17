package com.healthcare.notification.consumer;

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
