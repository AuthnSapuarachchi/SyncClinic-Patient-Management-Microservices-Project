package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.AppointmentBookedEvent;
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
public class AppointmentNotificationHandler {

	@Autowired
	private EmailService emailService;

	@Autowired
	private SmsService smsService;

	@Autowired
	private NotificationLogRepository notificationLogRepository;

	public void handleAppointmentBooked(AppointmentBookedEvent event) {
		log.info("Handling appointment booked notification for appointment: {}", event.getAppointmentId());

		// Send email to patient
		try {
			String patientEmailSubject = "✅ Appointment Confirmed – " + event.getAppointmentDate();
			String patientEmailBody = buildAppointmentBookedPatientEmail(event);
			emailService.sendHtmlEmail(event.getPatientEmail(), patientEmailSubject, patientEmailBody);

			saveNotificationLog(event.getPatientEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_BOOKED, patientEmailSubject,
					patientEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient appointment booked email", e);
			saveNotificationLog(event.getPatientEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to patient
		try {
			String patientSmsBody = "Hi " + event.getPatientName() + ", appt with Dr." + event.getDoctorName()
					+ " on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + " confirmed.";
			smsService.sendSms(event.getPatientPhone(), patientSmsBody);

			saveNotificationLog(event.getPatientPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "SMS",
					patientSmsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient appointment booked SMS", e);
			saveNotificationLog(event.getPatientPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send email to doctor
		try {
			String doctorEmailSubject = "📅 New Appointment – " + event.getPatientName();
			String doctorEmailBody = buildAppointmentBookedDoctorEmail(event);
			emailService.sendHtmlEmail(event.getDoctorEmail(), doctorEmailSubject, doctorEmailBody);

			saveNotificationLog(event.getDoctorEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_BOOKED, doctorEmailSubject,
					doctorEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send doctor appointment booked email", e);
			saveNotificationLog(event.getDoctorEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to doctor
		try {
			String doctorSmsBody = "Hi Dr." + event.getDoctorName() + ", new patient appointment with "
					+ event.getPatientName() + " on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + ".";
			smsService.sendSms(event.getDoctorPhone(), doctorSmsBody);

			saveNotificationLog(event.getDoctorPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "SMS",
					doctorSmsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send doctor appointment booked SMS", e);
			saveNotificationLog(event.getDoctorPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		log.info("Appointment booked notifications sent successfully");
	}

	private String buildAppointmentBookedPatientEmail(AppointmentBookedEvent event) {
		return "<html><body>" +
				"<h2>✅ Appointment Confirmed</h2>" +
				"<p>Dear " + event.getPatientName() + ",</p>" +
				"<p>Your appointment has been confirmed with the following details:</p>" +
				"<ul>" +
				"<li><strong>Doctor:</strong> Dr. " + event.getDoctorName() + "</li>" +
				"<li><strong>Specialty:</strong> " + event.getSpecialty() + "</li>" +
				"<li><strong>Date:</strong> " + event.getAppointmentDate() + "</li>" +
				"<li><strong>Time:</strong> " + event.getAppointmentTime() + "</li>" +
				"</ul>" +
				"<p>Please join 5 minutes early for a smooth experience.</p>" +
				"<p>Best regards,<br/>SyncClinic Team</p>" +
				"</body></html>";
	}

	private String buildAppointmentBookedDoctorEmail(AppointmentBookedEvent event) {
		return "<html><body>" +
				"<h2>📅 New Appointment</h2>" +
				"<p>Dear Dr. " + event.getDoctorName() + ",</p>" +
				"<p>You have a new appointment with the following patient:</p>" +
				"<ul>" +
				"<li><strong>Patient:</strong> " + event.getPatientName() + "</li>" +
				"<li><strong>Date:</strong> " + event.getAppointmentDate() + "</li>" +
				"<li><strong>Time:</strong> " + event.getAppointmentTime() + "</li>" +
				"</ul>" +
				"<p>Please ensure you are ready to start on time.</p>" +
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
