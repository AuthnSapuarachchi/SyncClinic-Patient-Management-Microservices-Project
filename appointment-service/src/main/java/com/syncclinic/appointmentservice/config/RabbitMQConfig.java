package com.syncclinic.appointmentservice.config;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String APPOINTMENT_QUEUE = "appointment_queue";
    public static final String HEALTHCARE_EXCHANGE = "healthcare.exchange";

    @Bean
    public org.springframework.amqp.core.TopicExchange healthcareExchange() {
        return new org.springframework.amqp.core.TopicExchange(HEALTHCARE_EXCHANGE);
    }

    // This ensures the Appointment Service sends JSON, not messy Java byte code
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}