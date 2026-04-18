package com.healthcare.notification.consumer;

import com.healthcare.notification.config.RabbitMQConfig;
import com.healthcare.notification.dto.events.AppointmentBookedEvent;
import com.healthcare.notification.dto.events.PaymentSuccessEvent;
import com.healthcare.notification.handler.AppointmentNotificationHandler;
import com.healthcare.notification.handler.PaymentNotificationHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    @Autowired
    private AppointmentNotificationHandler appointmentHandler;

    @Autowired
    private PaymentNotificationHandler paymentHandler;

    @RabbitListener(queues = RabbitMQConfig.APPOINTMENT_QUEUE)
    public void consumeAppointmentEvent(AppointmentBookedEvent event) {
        System.out.println("Appointment message pulled from RabbitMQ: " + event.getPatientEmail());
        appointmentHandler.processAppointmentEmail(event);
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_QUEUE)
    public void consumePaymentEvent(PaymentSuccessEvent event) {
        System.out.println("📥 Payment Message pulled from RabbitMQ: " + event.getPaymentId());

        // FIX: Change this line to processPaymentReceipt so it matches the Handler class!
        paymentHandler.processPaymentReceipt(event);
    }
}