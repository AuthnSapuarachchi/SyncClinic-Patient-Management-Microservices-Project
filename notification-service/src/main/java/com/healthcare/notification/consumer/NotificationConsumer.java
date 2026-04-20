package com.healthcare.notification.consumer;

import com.healthcare.notification.config.RabbitMQConfig;
import com.healthcare.notification.dto.events.AppointmentBookedEvent;
import com.healthcare.notification.dto.events.PaymentInitiatedEvent;
import com.healthcare.notification.dto.events.PaymentSuccessEvent;
import com.healthcare.notification.handler.AppointmentNotificationHandler;
import com.healthcare.notification.handler.PaymentNotificationHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final AppointmentNotificationHandler notificationHandler;
    private final PaymentNotificationHandler paymentNotificationHandler;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_APPOINTMENT_BOOKED)
    public void handleAppointmentBooked(AppointmentBookedEvent event) {
        log.info("Received AppointmentBookedEvent for appointmentId: {}", event.getAppointmentId());
        notificationHandler.handle(event);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_PAYMENT_SUCCESS)
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Received PaymentSuccessEvent for paymentId: {} and appointmentId: {}", event.getPaymentId(), event.getAppointmentId());
        paymentNotificationHandler.handlePaymentSuccess(event);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_PAYMENT_INITIATED)
    public void handlePaymentInitiated(PaymentInitiatedEvent event) {
        log.info("Received PaymentInitiatedEvent for paymentId: {} and appointmentId: {}", event.getPaymentId(), event.getAppointmentId());
        paymentNotificationHandler.handlePaymentInitiated(event);
    }
}
