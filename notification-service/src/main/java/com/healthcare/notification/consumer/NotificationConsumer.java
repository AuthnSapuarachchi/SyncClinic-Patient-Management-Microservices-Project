package com.healthcare.notification.consumer;

import com.healthcare.notification.config.RabbitMQConfig;
import com.healthcare.notification.dto.events.*;
import com.healthcare.notification.handler.AppointmentCancellationHandler;
import com.healthcare.notification.handler.AppointmentNotificationHandler;
import com.healthcare.notification.handler.ConsultationNotificationHandler;
import com.healthcare.notification.handler.PaymentNotificationHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationConsumer {

	@Autowired
	private AppointmentNotificationHandler appointmentNotificationHandler;

	@Autowired
	private AppointmentCancellationHandler appointmentCancellationHandler;

	@Autowired
	private ConsultationNotificationHandler consultationNotificationHandler;

	@Autowired
	private PaymentNotificationHandler paymentNotificationHandler;

	@RabbitListener(queues = RabbitMQConfig.APPOINTMENT_BOOKED_QUEUE)
	public void handleAppointmentBooked(AppointmentBookedEvent event) {
		try {
			log.info("Received appointment booked event for appointment: {}", event.getAppointmentId());
			appointmentNotificationHandler.handleAppointmentBooked(event);
			log.info("Successfully processed appointment booked event");
		} catch (Exception e) {
			log.error("Error processing appointment booked event", e);
			throw e;
		}
	}

	@RabbitListener(queues = RabbitMQConfig.APPOINTMENT_CANCELLED_QUEUE)
	public void handleAppointmentCancelled(AppointmentCancelledEvent event) {
		try {
			log.info("Received appointment cancelled event for appointment: {}", event.getAppointmentId());
			appointmentCancellationHandler.handleAppointmentCancelled(event);
			log.info("Successfully processed appointment cancelled event");
		} catch (Exception e) {
			log.error("Error processing appointment cancelled event", e);
			throw e;
		}
	}

	@RabbitListener(queues = RabbitMQConfig.CONSULTATION_COMPLETED_QUEUE)
	public void handleConsultationCompleted(ConsultationCompletedEvent event) {
		try {
			log.info("Received consultation completed event for appointment: {}", event.getAppointmentId());
			consultationNotificationHandler.handleConsultationCompleted(event);
			log.info("Successfully processed consultation completed event");
		} catch (Exception e) {
			log.error("Error processing consultation completed event", e);
			throw e;
		}
	}

	@RabbitListener(queues = RabbitMQConfig.PAYMENT_SUCCESS_QUEUE)
	public void handlePaymentSuccess(PaymentSuccessEvent event) {
		try {
			log.info("Received payment success event for payment: {}", event.getPaymentId());
			paymentNotificationHandler.handlePaymentSuccess(event);
			log.info("Successfully processed payment success event");
		} catch (Exception e) {
			log.error("Error processing payment success event", e);
			throw e;
		}
	}

	@RabbitListener(queues = RabbitMQConfig.PAYMENT_FAILED_QUEUE)
	public void handlePaymentFailed(PaymentFailedEvent event) {
		try {
			log.info("Received payment failed event for patient: {}", event.getPatientName());
			paymentNotificationHandler.handlePaymentFailed(event);
			log.info("Successfully processed payment failed event");
		} catch (Exception e) {
			log.error("Error processing payment failed event", e);
			throw e;
		}
	}

}
