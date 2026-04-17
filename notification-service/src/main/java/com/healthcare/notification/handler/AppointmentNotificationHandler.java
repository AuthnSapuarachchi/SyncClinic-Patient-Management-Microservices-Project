package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.AppointmentBookedEvent;
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
public class AppointmentNotificationHandler {

	@Autowired
	private EmailService emailService;

	@Autowired
	private SmsService smsService;

	@Autowired
	private NotificationLogRepository notificationLogRepository;

	@Autowired
	private DirectoryLookupService directoryLookupService;

	public void handleAppointmentBooked(AppointmentBookedEvent event) {
		log.info("Handling appointment booked notification for appointment: {}", event.getAppointmentId());

		Long patientId = parseId(event.getPatientId(), "patient");
		Long doctorId = parseId(event.getDoctorId(), "doctor");
		PatientDirectoryResponse patient = directoryLookupService.getPatient(patientId);
		DoctorDirectoryResponse doctor = directoryLookupService.getDoctor(doctorId);

		// Send email to patient
		try {
			String patientEmailSubject = "✅ Appointment Confirmed – " + event.getAppointmentDate();
			String patientEmailBody = buildAppointmentBookedPatientEmail(event, patient, doctor);
			emailService.sendHtmlEmail(patient.getEmail(), patientEmailSubject, patientEmailBody);

			saveNotificationLog(String.valueOf(patient.getId()), patient.getEmail(), null, event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_BOOKED, patientEmailSubject,
					patientEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient appointment booked email", e);
			saveNotificationLog(String.valueOf(patientId), patient != null ? patient.getEmail() : null, null, event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to patient
		try {
			String patientSmsBody = "Hi " + patient.getFirstName() + ", appt with Dr. " + doctor.getFullName()
					+ " on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + " confirmed.";
			smsService.sendSms(patient.getPhone(), patientSmsBody);

			saveNotificationLog(String.valueOf(patient.getId()), null, patient.getPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "SMS",
					patientSmsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send patient appointment booked SMS", e);
			saveNotificationLog(String.valueOf(patientId), null, patient != null ? patient.getPhone() : null, event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send email to doctor
		try {
			String doctorEmailSubject = "📅 New Appointment – " + patient.getFirstName() + " " + patient.getLastName();
			String doctorEmailBody = buildAppointmentBookedDoctorEmail(event, patient, doctor);
			emailService.sendHtmlEmail(doctor.getEmail(), doctorEmailSubject, doctorEmailBody);

			saveNotificationLog(String.valueOf(doctor.getId()), doctor.getEmail(), null, event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_BOOKED, doctorEmailSubject,
					doctorEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send doctor appointment booked email", e);
			saveNotificationLog(String.valueOf(doctorId), doctor != null ? doctor.getEmail() : null, null, event.getAppointmentId(), "EMAIL",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to doctor
		try {
			String doctorSmsBody = "Hi Dr. " + doctor.getFullName() + ", new patient appointment with "
					+ patient.getFullName() + " on " + event.getAppointmentDate() + " at " + event.getAppointmentTime() + ".";
			smsService.sendSms(doctor.getPhone(), doctorSmsBody);

			saveNotificationLog(String.valueOf(doctor.getId()), null, doctor.getPhone(), event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "SMS",
					doctorSmsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send doctor appointment booked SMS", e);
			saveNotificationLog(String.valueOf(doctorId), null, doctor != null ? doctor.getPhone() : null, event.getAppointmentId(), "SMS",
					NotificationLog.EventType.APPOINTMENT_BOOKED, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		log.info("Appointment booked notifications sent successfully");
	}

	private String buildAppointmentBookedPatientEmail(AppointmentBookedEvent event, PatientDirectoryResponse patient,
			DoctorDirectoryResponse doctor) {
		return "<html><body>" +
				"<h2>✅ Appointment Confirmed</h2>" +
				"<p>Dear " + patient.getFullName() + ",</p>" +
				"<p>Your appointment has been confirmed with the following details:</p>" +
				"<ul>" +
				"<li><strong>Doctor:</strong> Dr. " + doctor.getFullName() + "</li>" +
				"<li><strong>Specialty:</strong> " + doctor.getSpecialty() + "</li>" +
				"<li><strong>Date:</strong> " + event.getAppointmentDate() + "</li>" +
				"<li><strong>Time:</strong> " + event.getAppointmentTime() + "</li>" +
				"</ul>" +
				"<p>Please join 5 minutes early for a smooth experience.</p>" +
				"<p>Best regards,<br/>SyncClinic Team</p>" +
				"</body></html>";
	}

	private String buildAppointmentBookedDoctorEmail(AppointmentBookedEvent event, PatientDirectoryResponse patient,
			DoctorDirectoryResponse doctor) {
		return "<html><body>" +
				"<h2>📅 New Appointment</h2>" +
				"<p>Dear Dr. " + doctor.getFullName() + ",</p>" +
				"<p>You have a new appointment with the following patient:</p>" +
				"<ul>" +
				"<li><strong>Patient:</strong> " + patient.getFullName() + "</li>" +
				"<li><strong>Date:</strong> " + event.getAppointmentDate() + "</li>" +
				"<li><strong>Time:</strong> " + event.getAppointmentTime() + "</li>" +
				"</ul>" +
				"<p>Please ensure you are ready to start on time.</p>" +
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
