package com.healthcare.telemedicine.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

	// Exchange
	public static final String HEALTHCARE_EXCHANGE = "healthcare.exchange";

	// Queues
	public static final String APPOINTMENT_CONFIRMED_QUEUE = "appointment.confirmed";
	public static final String CONSULTATION_COMPLETED_QUEUE = "consultation.completed";

	// Routing Keys
	public static final String APPOINTMENT_CONFIRMED_ROUTING_KEY = "appointment.confirmed";
	public static final String CONSULTATION_COMPLETED_ROUTING_KEY = "consultation.completed";

	// Exchange Bean
	@Bean
	public TopicExchange healthcareExchange() {
		return new TopicExchange(HEALTHCARE_EXCHANGE, true, false);
	}

	// Queues
	@Bean
	public Queue appointmentConfirmedQueue() {
		return new Queue(APPOINTMENT_CONFIRMED_QUEUE, true);
	}

	@Bean
	public Queue consultationCompletedQueue() {
		return new Queue(CONSULTATION_COMPLETED_QUEUE, true);
	}

	// Bindings
	@Bean
	public Binding appointmentConfirmedBinding(Queue appointmentConfirmedQueue, TopicExchange healthcareExchange) {
		return BindingBuilder.bind(appointmentConfirmedQueue)
				.to(healthcareExchange)
				.with(APPOINTMENT_CONFIRMED_ROUTING_KEY);
	}

	@Bean
	public Binding consultationCompletedBinding(Queue consultationCompletedQueue, TopicExchange healthcareExchange) {
		return BindingBuilder.bind(consultationCompletedQueue)
				.to(healthcareExchange)
				.with(CONSULTATION_COMPLETED_ROUTING_KEY);
	}

	// Message Converter
	@Bean
	public MessageConverter jackson2MessageConverter() {
		return new Jackson2JsonMessageConverter();
	}

}
