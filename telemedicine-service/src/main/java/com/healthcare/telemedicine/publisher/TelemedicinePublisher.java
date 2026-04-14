package com.healthcare.telemedicine.publisher;

import com.healthcare.telemedicine.config.RabbitMQConfig;
import com.healthcare.telemedicine.dto.events.ConsultationCompletedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TelemedicinePublisher {

	@Autowired
	private RabbitTemplate rabbitTemplate;

	public void publishConsultationCompleted(ConsultationCompletedEvent event) {
		try {
			log.info("Publishing consultation completed event for appointment: {}", event.getAppointmentId());
			rabbitTemplate.convertAndSend(
					RabbitMQConfig.HEALTHCARE_EXCHANGE,
					RabbitMQConfig.CONSULTATION_COMPLETED_ROUTING_KEY,
					event);
			log.info("Consultation completed event published successfully");
		} catch (Exception e) {
			log.error("Error publishing consultation completed event", e);
			throw new RuntimeException("Failed to publish consultation completed event", e);
		}
	}

}
