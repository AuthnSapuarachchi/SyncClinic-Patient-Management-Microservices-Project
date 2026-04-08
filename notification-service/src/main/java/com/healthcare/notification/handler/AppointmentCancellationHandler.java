package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.AppointmentCancelledEvent;
import com.healthcare.notification.model.NotificationLog;
import com.healthcare.notification.repository.NotificationLogRepository;
import com.healthcare.notification.service.EmailService;
import com.healthcare.notification.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Slf4j
public class AppointmentCancellationHandler {

	@Autowired
	private EmailService emailService;

	@Autowired
	private SmsService smsService;

	@Autowired
	private NotificationLogRepository notificationLogRepository;

	public void handleAppointmentCancelled(AppointmentCancelledEvent event) {
		log.info("Handling appointment cancelled notification for appointment: {}", event.getAppointmentId());

		// Send email to patient
		try {
			String patientEmailSubject = "❌ Appointment Cancelled – " + event.getAppointmentDate();
			String patientEmailBody = buildAppointmentCancelledPatientEmail(event);
			emailService.sendHtmlEmail(event.getPatientEmail(), patientEmailSubject, patientEmailBody);

			saveNotificationLog(event.getPatientEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, patientEmailSubject,
					patientEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient appointment cancelled email", e);
			saveNotificationLog(event.getPatientEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to patient
		try {
			String patientSmsBody = "Hi " + event.getPatientName() + ", your appt with Dr." + event.getDoctorName()
					+ " on " + event.getAppointmentDate() + " has been cancelled.";
			smsService.sendSms(event.getPatientPhone(), patientSmsBody);

			saveNotificationLog(event.getPatientPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, "SMS",
					patientSmsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient appointment cancelled SMS", e);
			saveNotificationLog(event.getPatientPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send email to doctor
		try {
			String doctorEmailSubject = "❌ Appointment Cancelled – " + event.getPatientName();
			String doctorEmailBody = buildAppointmentCancelledDoctorEmail(event);
			emailService.sendHtmlEmail(event.getDoctorEmail(), doctorEmailSubject, doctorEmailBody);

			saveNotificationLog(event.getDoctorEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, doctorEmailSubject,
					doctorEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send doctor appointment cancelled email", e);
			saveNotificationLog(event.getDoctorEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		log.info("Appointment cancelled notifications sent successfully");
	}

	private String buildAppointmentCancelledPatientEmail(AppointmentCancelledEvent event) {
		return "<html><body>" +
				"<h2>❌ Appointment Cancelled</h2>" +
				"<p>Dear " + event.getPatientName() + ",</p>" +
				"<p>Your appointment has been cancelled with the following details:</p>" +
				"<ul>" +
				"<li><strong>Doctor:</strong> Dr. " + event.getDoctorName() + "</li>" +
				"<li><strong>Date:</strong> " + event.getAppointmentDate() + "</li>" +
				"<li><strong>Time:</strong> " + event.getAppointmentTime() + "</li>" +
				"<li><strong>Reason:</strong> " + event.getReason() + "</li>" +
				"</ul>" +
				"<p>Please feel free to book another appointment at your convenience.</p>" +
				"<p>Best regards,<br/>SyncClinic Team</p>" +
				"</body></html>";
	}

	private String buildAppointmentCancelledDoctorEmail(AppointmentCancelledEvent event) {
		return "<html><body>" +
				"<h2>❌ Appointment Cancelled</h2>" +
				"<p>Dear Dr. " + event.getDoctorName() + ",</p>" +
				"<p>The following appointment has been cancelled:</p>" +
				"<ul>" +
				"<li><strong>Patient:</strong> " + event.getPatientName() + "</li>" +
				"<li><strong>Date:</strong> " + event.getAppointmentDate() + "</li>" +
				"<li><strong>Time:</strong> " + event.getAppointmentTime() + "</li>" +
				"<li><strong>Reason:</strong> " + event.getReason() + "</li>" +
				"</ul>" +
				"<p>Best regards,<br/>SyncClinic Team</p>" +
				"</body></html>";
	}

	private void saveNotificationLog(String recipient, String referenceId, String type,
			NotificationLog.EventType eventType, String subject, String message,
			NotificationLog.NotificationStatus status, String errorMessage) {
		try {
			NotificationLog log = NotificationLog.builder()
					.userId(referenceId)
					.recipientEmail(type.equals("EMAIL") ? recipient : null)
					.recipientPhone(type.equals("SMS") ? recipient : null)
					.type(NotificationLog.NotificationType.valueOf(type))
					.eventType(eventType)
					.subject(subject)
					.message(message)
					.status(status)
					.sentAt(LocalDateTime.now())
					.errorMessage(errorMessage)
					.build();
			notificationLogRepository.save(log);
		} catch (Exception e) {
			log.error("Failed to save notification log", e);
		}
	}

}
