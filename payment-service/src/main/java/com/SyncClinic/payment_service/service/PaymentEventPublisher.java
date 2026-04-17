package com.SyncClinic.payment_service.service;

import com.SyncClinic.payment_service.config.RabbitMQConfig;
import com.SyncClinic.payment_service.dto.events.PaymentFailedEvent;
import com.SyncClinic.payment_service.dto.events.PaymentSuccessEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class PaymentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public PaymentEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishPaymentSuccess(PaymentSuccessEvent event) {
        log.info("Publishing PaymentSuccessEvent for appointmentId: {}", event.getAppointmentId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.HEALTHCARE_EXCHANGE, "payment.success", event);
    }

    public void publishPaymentFailed(PaymentFailedEvent event) {
        log.info("Publishing PaymentFailedEvent for appointmentId: {}", event.getAppointmentId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.HEALTHCARE_EXCHANGE, "payment.failed", event);
    }
}
