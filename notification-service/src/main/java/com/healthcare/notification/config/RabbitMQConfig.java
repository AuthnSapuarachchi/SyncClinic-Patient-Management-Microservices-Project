package com.healthcare.notification.config;

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
	public static final String APPOINTMENT_BOOKED_QUEUE = "appointment.booked";
	public static final String APPOINTMENT_CANCELLED_QUEUE = "appointment.cancelled";
	public static final String CONSULTATION_COMPLETED_QUEUE = "consultation.completed";
	public static final String PAYMENT_SUCCESS_QUEUE = "payment.success";
	public static final String PAYMENT_FAILED_QUEUE = "payment.failed";

	// Routing Keys
	public static final String APPOINTMENT_BOOKED_ROUTING_KEY = "appointment.booked";
	public static final String APPOINTMENT_CANCELLED_ROUTING_KEY = "appointment.cancelled";
	public static final String CONSULTATION_COMPLETED_ROUTING_KEY = "consultation.completed";
	public static final String PAYMENT_SUCCESS_ROUTING_KEY = "payment.success";
	public static final String PAYMENT_FAILED_ROUTING_KEY = "payment.failed";

	// Exchange Bean
	@Bean
	public TopicExchange healthcareExchange() {
		return new TopicExchange(HEALTHCARE_EXCHANGE, true, false);
	}

	// Queues
	@Bean
	public Queue appointmentBookedQueue() {
		return new Queue(APPOINTMENT_BOOKED_QUEUE, true);
	}

	@Bean
	public Queue appointmentCancelledQueue() {
		return new Queue(APPOINTMENT_CANCELLED_QUEUE, true);
	}

	@Bean
	public Queue consultationCompletedQueue() {
		return new Queue(CONSULTATION_COMPLETED_QUEUE, true);
	}

	@Bean
	public Queue paymentSuccessQueue() {
		return new Queue(PAYMENT_SUCCESS_QUEUE, true);
	}

	@Bean
	public Queue paymentFailedQueue() {
		return new Queue(PAYMENT_FAILED_QUEUE, true);
	}

	// Bindings
	@Bean
	public Binding appointmentBookedBinding(Queue appointmentBookedQueue, TopicExchange healthcareExchange) {
		return BindingBuilder.bind(appointmentBookedQueue)
				.to(healthcareExchange)
				.with(APPOINTMENT_BOOKED_ROUTING_KEY);
	}

	@Bean
	public Binding appointmentCancelledBinding(Queue appointmentCancelledQueue, TopicExchange healthcareExchange) {
		return BindingBuilder.bind(appointmentCancelledQueue)
				.to(healthcareExchange)
				.with(APPOINTMENT_CANCELLED_ROUTING_KEY);
	}

	@Bean
	public Binding consultationCompletedBinding(Queue consultationCompletedQueue, TopicExchange healthcareExchange) {
		return BindingBuilder.bind(consultationCompletedQueue)
				.to(healthcareExchange)
				.with(CONSULTATION_COMPLETED_ROUTING_KEY);
	}

	@Bean
	public Binding paymentSuccessBinding(Queue paymentSuccessQueue, TopicExchange healthcareExchange) {
		return BindingBuilder.bind(paymentSuccessQueue)
				.to(healthcareExchange)
				.with(PAYMENT_SUCCESS_ROUTING_KEY);
	}

	@Bean
	public Binding paymentFailedBinding(Queue paymentFailedQueue, TopicExchange healthcareExchange) {
		return BindingBuilder.bind(paymentFailedQueue)
				.to(healthcareExchange)
				.with(PAYMENT_FAILED_ROUTING_KEY);
	}

	// Message Converter
	@Bean
	public MessageConverter jackson2MessageConverter() {
		return new Jackson2JsonMessageConverter();
	}

}
