package com.syncclinic.appointmentservice.service;

import com.syncclinic.appointmentservice.config.RabbitMQConfig;
import com.syncclinic.appointmentservice.dto.events.AppointmentBookedEvent;
import com.syncclinic.appointmentservice.dto.events.AppointmentCancelledEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AppointmentEventPublisher {

	private final RabbitTemplate rabbitTemplate;

	public AppointmentEventPublisher(RabbitTemplate rabbitTemplate) {
		this.rabbitTemplate = rabbitTemplate;
	}

	public void publishAppointmentBooked(AppointmentBookedEvent event) {
		log.info("Publishing appointment booked event for appointmentId: {}", event.getAppointmentId());
		rabbitTemplate.convertAndSend(RabbitMQConfig.HEALTHCARE_EXCHANGE, "appointment.booked", event);
	}

	public void publishAppointmentCancelled(AppointmentCancelledEvent event) {
		log.info("Publishing appointment cancelled event for appointmentId: {}", event.getAppointmentId());
		rabbitTemplate.convertAndSend(RabbitMQConfig.HEALTHCARE_EXCHANGE, "appointment.cancelled", event);
	}
}