package com.healthcare.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_APPOINTMENT_BOOKED = "queue.appointment.booked";
    public static final String QUEUE_PAYMENT_SUCCESS = "queue.payment.success";
    public static final String EXCHANGE_HEALTHCARE = "healthcare.exchange";
    public static final String ROUTING_KEY_APPOINTMENT_BOOKED = "appointment.booked";
    public static final String ROUTING_KEY_PAYMENT_SUCCESS = "payment.success";

    @Bean
    public Queue appointmentBookedQueue() {
        return new Queue(QUEUE_APPOINTMENT_BOOKED, true);
    }

    @Bean
    public Queue paymentSuccessQueue() {
        return new Queue(QUEUE_PAYMENT_SUCCESS, true);
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
    public Binding paymentSuccessBinding(Queue paymentSuccessQueue, TopicExchange healthcareExchange) {
        return BindingBuilder.bind(paymentSuccessQueue).to(healthcareExchange).with(ROUTING_KEY_PAYMENT_SUCCESS);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
