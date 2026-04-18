package com.healthcare.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String APPOINTMENT_QUEUE = "appointment_queue";
    public static final String PAYMENT_QUEUE = "payment_queue";
    public static final String HEALTHCARE_EXCHANGE = "healthcare.exchange";

    @Bean
    public TopicExchange healthcareExchange() {
        return new TopicExchange(HEALTHCARE_EXCHANGE);
    }

    @Bean
    public Queue appointmentQueue() {
        // true means the queue survives a RabbitMQ restart
        return new Queue(APPOINTMENT_QUEUE, true);
    }

    @Bean
    public Binding appointmentBinding(Queue appointmentQueue, TopicExchange healthcareExchange) {
        return BindingBuilder.bind(appointmentQueue).to(healthcareExchange).with("appointment.*");
    }

    @Bean
    public Queue paymentQueue() {
        return new Queue(PAYMENT_QUEUE, true);
    }

    @Bean
    public Binding paymentBinding(Queue paymentQueue, TopicExchange healthcareExchange) {
        return BindingBuilder.bind(paymentQueue).to(healthcareExchange).with("payment.*");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        // This magic bean translates RabbitMQ JSON into your Java Event object
        return new Jackson2JsonMessageConverter();
    }
}
