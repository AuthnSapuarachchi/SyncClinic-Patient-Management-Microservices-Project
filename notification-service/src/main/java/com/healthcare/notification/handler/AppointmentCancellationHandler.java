package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.AppointmentCancelledEvent;
import com.healthcare.notification.dto.directory.DoctorDirectoryResponse;
import com.healthcare.notification.dto.directory.PatientDirectoryResponse;
import com.healthcare.notification.model.NotificationLog;
import com.healthcare.notification.repository.NotificationLogRepository;
import com.healthcare.notification.service.DirectoryLookupService;
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

	@Autowired
	private DirectoryLookupService directoryLookupService;

	public void handleAppointmentCancelled(AppointmentCancelledEvent event) {
		log.info("Handling appointment cancelled notification for appointment: {}", event.getAppointmentId());

		Long patientId = parseId(event.getPatientId(), "patient");
		Long doctorId = parseId(event.getDoctorId(), "doctor");
		PatientDirectoryResponse patient = directoryLookupService.getPatient(patientId);
		DoctorDirectoryResponse doctor = directoryLookupService.getDoctor(doctorId);

		// Send email to patient
		try {
			String patientEmailSubject = "❌ Appointment Cancelled – " + event.getAppointmentDate();
			String patientEmailBody = buildAppointmentCancelledPatientEmail(event, patient, doctor);
			emailService.sendHtmlEmail(patient.getEmail(), patientEmailSubject, patientEmailBody);

			saveNotificationLog(String.valueOf(patient.getId()), patient.getEmail(), null, event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, patientEmailSubject,
					patientEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient appointment cancelled email", e);
			saveNotificationLog(String.valueOf(patientId), patient != null ? patient.getEmail() : null, null, event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to patient
		try {
			String patientSmsBody = "Hi " + patient.getFullName() + ", your appt with Dr. " + doctor.getFullName()
					+ " on " + event.getAppointmentDate() + " has been cancelled.";
			smsService.sendSms(patient.getPhone(), patientSmsBody);

			saveNotificationLog(String.valueOf(patient.getId()), null, patient.getPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, "SMS",
					patientSmsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient appointment cancelled SMS", e);
			saveNotificationLog(String.valueOf(patientId), null, patient != null ? patient.getPhone() : null, event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send email to doctor
		try {
			String doctorEmailSubject = "❌ Appointment Cancelled – " + patient.getFullName();
			String doctorEmailBody = buildAppointmentCancelledDoctorEmail(event, patient, doctor);
			emailService.sendHtmlEmail(doctor.getEmail(), doctorEmailSubject, doctorEmailBody);

			saveNotificationLog(String.valueOf(doctor.getId()), doctor.getEmail(), null, event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, doctorEmailSubject,
					doctorEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send doctor appointment cancelled email", e);
			saveNotificationLog(String.valueOf(doctorId), doctor != null ? doctor.getEmail() : null, null, event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_CANCELLED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		log.info("Appointment cancelled notifications sent successfully");
	}

	private String buildAppointmentCancelledPatientEmail(AppointmentCancelledEvent event, PatientDirectoryResponse patient,
			DoctorDirectoryResponse doctor) {
		return "<html><body>" +
				"<h2>❌ Appointment Cancelled</h2>" +
				"<p>Dear " + patient.getFullName() + ",</p>" +
				"<p>Your appointment has been cancelled with the following details:</p>" +
				"<ul>" +
				"<li><strong>Doctor:</strong> Dr. " + doctor.getFullName() + "</li>" +
				"<li><strong>Date:</strong> " + event.getAppointmentDate() + "</li>" +
				"<li><strong>Time:</strong> " + event.getAppointmentTime() + "</li>" +
				"<li><strong>Reason:</strong> " + event.getReason() + "</li>" +
				"</ul>" +
				"<p>Please feel free to book another appointment at your convenience.</p>" +
				"<p>Best regards,<br/>SyncClinic Team</p>" +
				"</body></html>";
	}

	private String buildAppointmentCancelledDoctorEmail(AppointmentCancelledEvent event, PatientDirectoryResponse patient,
			DoctorDirectoryResponse doctor) {
		return "<html><body>" +
				"<h2>❌ Appointment Cancelled</h2>" +
				"<p>Dear Dr. " + doctor.getFullName() + ",</p>" +
				"<p>The following appointment has been cancelled:</p>" +
				"<ul>" +
				"<li><strong>Patient:</strong> " + patient.getFullName() + "</li>" +
				"<li><strong>Date:</strong> " + event.getAppointmentDate() + "</li>" +
				"<li><strong>Time:</strong> " + event.getAppointmentTime() + "</li>" +
				"<li><strong>Reason:</strong> " + event.getReason() + "</li>" +
				"</ul>" +
				"<p>Best regards,<br/>SyncClinic Team</p>" +
				"</body></html>";
	}

	private Long parseId(String id, String label) {
		try {
			return Long.valueOf(id);
		} catch (Exception e) {
			throw new IllegalArgumentException("Invalid " + label + " id: " + id, e);
		}
	}

	private void saveNotificationLog(String userId, String recipientEmail, String recipientPhone, String referenceId, String type,
			NotificationLog.EventType eventType, String subject, String message,
			NotificationLog.NotificationStatus status, String errorMessage) {
		try {
			NotificationLog log = NotificationLog.builder()
					.userId(userId)
					.recipientEmail(recipientEmail)
					.recipientPhone(recipientPhone)
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
