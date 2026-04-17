package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.ConsultationCompletedEvent;
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
public class ConsultationNotificationHandler {

	@Autowired
	private EmailService emailService;

	@Autowired
	private SmsService smsService;

	@Autowired
	private NotificationLogRepository notificationLogRepository;

	public void handleConsultationCompleted(ConsultationCompletedEvent event) {
		log.info("Handling consultation completed notification for appointment: {}", event.getAppointmentId());
		String userId = event.getPatientId() != null && !event.getPatientId().isBlank()
				? event.getPatientId()
				: event.getAppointmentId();

		// Send email to patient
		try {
			String patientEmailSubject = "🏥 Consultation Complete – Prescription Ready";
			String patientEmailBody = buildConsultationCompletedPatientEmail(event);
			emailService.sendHtmlEmail(event.getPatientEmail(), patientEmailSubject, patientEmailBody);

			saveNotificationLog(userId, event.getPatientEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.CONSULTATION_COMPLETED, patientEmailSubject,
					patientEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient consultation completed email", e);
			saveNotificationLog(userId, event.getPatientEmail(), event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.CONSULTATION_COMPLETED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to patient
		try {
			String patientSmsBody = "Hi " + event.getPatientName() + ", consultation with Dr." + event.getDoctorName()
					+ " complete. Check email for prescription.";
			smsService.sendSms(event.getPatientPhone(), patientSmsBody);

			saveNotificationLog(userId, event.getPatientPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.CONSULTATION_COMPLETED, "SMS",
					patientSmsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient consultation completed SMS", e);
			saveNotificationLog(userId, event.getPatientPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.CONSULTATION_COMPLETED, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		log.info("Consultation completed notifications sent successfully");
	}

	private String buildConsultationCompletedPatientEmail(ConsultationCompletedEvent event) {
		String prescriptionLink = event.getPrescriptionUrl() != null
				? "<p><a href='" + event.getPrescriptionUrl() + "' style='color: #004e89; text-decoration: none;'>Click here to download your prescription</a></p>"
				: "<p>Your prescription will be available shortly.</p>";

		return "<html><body>" +
				"<h2>🏥 Consultation Complete</h2>" +
				"<p>Dear " + event.getPatientName() + ",</p>" +
				"<p>Your consultation with Dr. " + event.getDoctorName() + " has been completed.</p>" +
				"<ul>" +
				"<li><strong>Session Duration:</strong> " + event.getSessionDuration() + " minutes</li>" +
				"</ul>" +
				"<h3>Prescription</h3>" +
				prescriptionLink +
				"<p>If you have any questions, please contact our support team.</p>" +
				"<p>Best regards,<br/>SyncClinic Team</p>" +
				"</body></html>";
	}

	private void saveNotificationLog(String userId, String recipient, String referenceId, String type,
			NotificationLog.EventType eventType, String subject, String message,
			NotificationLog.NotificationStatus status, String errorMessage) {
		try {
			NotificationLog log = NotificationLog.builder()
					.userId(userId)
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
