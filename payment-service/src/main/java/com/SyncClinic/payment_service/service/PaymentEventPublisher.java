package com.SyncClinic.payment_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.SyncClinic.payment_service.dto.events.PaymentFailedEvent;
import com.SyncClinic.payment_service.dto.events.PaymentSuccessEvent;
 
@Service
public class PaymentEventPublisher {
 
    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);
 
    private final KafkaTemplate<String, Object> kafkaTemplate;
 
    @Value("${kafka.topic.payment-success}")
    private String paymentSuccessTopic;
 
    @Value("${kafka.topic.payment-failed}")
    private String paymentFailedTopic;
 
    public PaymentEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }
 
    public void publishPaymentSuccess(PaymentSuccessEvent event) {
        log.info("Publishing PaymentSuccessEvent for appointmentId: {}", event.getAppointmentId());
        kafkaTemplate.send(paymentSuccessTopic, event.getPaymentId(), event);
    }
 
    public void publishPaymentFailed(PaymentFailedEvent event) {
        log.info("Publishing PaymentFailedEvent for appointmentId: {}", event.getAppointmentId());
        kafkaTemplate.send(paymentFailedTopic, event.getPaymentId(), event);
    }
}
