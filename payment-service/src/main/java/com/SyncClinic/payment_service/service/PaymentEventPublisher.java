package com.SyncClinic.payment_service.service;

import com.SyncClinic.payment_service.dto.events.PaymentFailedEvent;
import com.SyncClinic.payment_service.dto.events.PaymentSuccessEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {
 
    private final KafkaTemplate<String, Object> kafkaTemplate;
 
    @Value("${kafka.topic.payment-success}")
    private String paymentSuccessTopic;
 
    @Value("${kafka.topic.payment-failed}")
    private String paymentFailedTopic;
 
    public void publishPaymentSuccess(PaymentSuccessEvent event) {
        log.info("Publishing PaymentSuccessEvent for appointmentId: {}", event.getAppointmentId());
        kafkaTemplate.send(paymentSuccessTopic, event.getPaymentId(), event);
    }
 
    public void publishPaymentFailed(PaymentFailedEvent event) {
        log.info("Publishing PaymentFailedEvent for appointmentId: {}", event.getAppointmentId());
        kafkaTemplate.send(paymentFailedTopic, event.getPaymentId(), event);
    }
}
