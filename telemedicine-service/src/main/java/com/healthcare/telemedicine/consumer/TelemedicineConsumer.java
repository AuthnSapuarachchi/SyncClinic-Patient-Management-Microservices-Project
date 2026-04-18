package com.healthcare.telemedicine.consumer;

import com.healthcare.telemedicine.config.RabbitMQConfig;
import com.healthcare.telemedicine.dto.events.AppointmentConfirmedEvent;
import com.healthcare.telemedicine.service.SessionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TelemedicineConsumer {

	@Autowired
	private SessionService sessionService;

	@RabbitListener(queues = RabbitMQConfig.APPOINTMENT_CONFIRMED_QUEUE)
	public void handleAppointmentConfirmed(AppointmentConfirmedEvent event) {
		try {
			log.info("Received appointment confirmed event for appointment: {}", event.getAppointmentId());
			sessionService.createSession(event);
			log.info("Successfully processed appointment confirmed event");
		} catch (Exception e) {
			log.error("Error processing appointment confirmed event", e);
			throw e;
		}
	}

}
