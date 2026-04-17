package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.PaymentFailedEvent;
import com.healthcare.notification.dto.events.PaymentSuccessEvent;
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
public class PaymentNotificationHandler {

	@Autowired
	private EmailService emailService;

	@Autowired
	private SmsService smsService;

	@Autowired
	private NotificationLogRepository notificationLogRepository;

	@Autowired
	private DirectoryLookupService directoryLookupService;

	public void handlePaymentSuccess(PaymentSuccessEvent event) {
		log.info("Handling payment success notification for payment: {}", event.getPaymentId());

		Long patientId = parseId(event.getPatientId(), "patient");
		PatientDirectoryResponse patient = directoryLookupService.getPatient(patientId);

		// Send email to patient
		try {
			String patientEmailSubject = "💳 Payment Confirmed – " + event.getPaymentId();
			String patientEmailBody = buildPaymentSuccessEmail(event, patient);
			emailService.sendHtmlEmail(patient.getEmail(), patientEmailSubject, patientEmailBody);

			saveNotificationLog(String.valueOf(patient.getId()), patient.getEmail(), null, event.getPaymentId(), "EMAIL",
					NotificationLog.EventType.PAYMENT_SUCCESS, patientEmailSubject,
					patientEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send payment success email", e);
			saveNotificationLog(String.valueOf(patientId), patient != null ? patient.getEmail() : null, null, event.getPaymentId(), "EMAIL",
					NotificationLog.EventType.PAYMENT_SUCCESS, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to patient
		try {
			String smsBody = "Payment of " + event.getCurrency() + " " + event.getAmount()
					+ " confirmed. Txn: " + event.getPaymentId() + ".";
			smsService.sendSms(patient.getPhone(), smsBody);

			saveNotificationLog(String.valueOf(patient.getId()), null, patient.getPhone(), event.getPaymentId(), "SMS",
					NotificationLog.EventType.PAYMENT_SUCCESS, "SMS",
					smsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send payment success SMS", e);
			saveNotificationLog(String.valueOf(patientId), null, patient != null ? patient.getPhone() : null, event.getPaymentId(), "SMS",
					NotificationLog.EventType.PAYMENT_SUCCESS, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		log.info("Payment success notifications sent successfully");
	}

	public void handlePaymentFailed(PaymentFailedEvent event) {
		log.info("Handling payment failed notification for patient: {}", event.getPatientName());

		Long patientId = parseId(event.getPatientId(), "patient");
		PatientDirectoryResponse patient = directoryLookupService.getPatient(patientId);

		// Send email to patient
		try {
			String patientEmailSubject = "⚠️ Payment Failed – Action Required";
			String patientEmailBody = buildPaymentFailedEmail(event, patient);
			emailService.sendHtmlEmail(patient.getEmail(), patientEmailSubject, patientEmailBody);

			saveNotificationLog(String.valueOf(patient.getId()), patient.getEmail(), null, event.getPaymentId(), "EMAIL",
					NotificationLog.EventType.PAYMENT_FAILED, patientEmailSubject,
					patientEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send payment failed email", e);
			saveNotificationLog(String.valueOf(patientId), patient != null ? patient.getEmail() : null, null, event.getPaymentId(), "EMAIL",
					NotificationLog.EventType.PAYMENT_FAILED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to patient
		try {
			String smsBody = "Payment of " + event.getCurrency() + " " + event.getAmount()
					+ " failed. Reason: " + event.getFailureReason() + ". Please retry.";
			smsService.sendSms(patient.getPhone(), smsBody);

			saveNotificationLog(String.valueOf(patient.getId()), null, patient.getPhone(), event.getPaymentId(), "SMS",
					NotificationLog.EventType.PAYMENT_FAILED, "SMS",
					smsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send payment failed SMS", e);
			saveNotificationLog(String.valueOf(patientId), null, patient != null ? patient.getPhone() : null, event.getPaymentId(), "SMS",
					NotificationLog.EventType.PAYMENT_FAILED, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		log.info("Payment failed notifications sent successfully");
	}

	private String buildPaymentSuccessEmail(PaymentSuccessEvent event, PatientDirectoryResponse patient) {
		return "<html><body>" +
				"<h2>💳 Payment Confirmed</h2>" +
				"<p>Dear " + patient.getFullName() + ",</p>" +
				"<p>Your payment has been successfully processed. Here are the details:</p>" +
				"<ul>" +
				"<li><strong>Payment ID:</strong> " + event.getPaymentId() + "</li>" +
				"<li><strong>Amount:</strong> " + event.getCurrency() + " " + event.getAmount() + "</li>" +
				"<li><strong>Payment Method:</strong> " + event.getPaymentMethod() + "</li>" +
				"<li><strong>Doctor:</strong> Dr. " + event.getDoctorName() + "</li>" +
				"</ul>" +
				"<p>Thank you for using SyncClinic. Your consultation can now proceed.</p>" +
				"<p>Best regards,<br/>SyncClinic Team</p>" +
				"</body></html>";
	}

	private String buildPaymentFailedEmail(PaymentFailedEvent event, PatientDirectoryResponse patient) {
		return "<html><body>" +
				"<h2>⚠️ Payment Failed</h2>" +
				"<p>Dear " + patient.getFullName() + ",</p>" +
				"<p>Unfortunately, your payment could not be processed. Please review and retry:</p>" +
				"<ul>" +
				"<li><strong>Amount:</strong> " + event.getCurrency() + " " + event.getAmount() + "</li>" +
				"<li><strong>Reason:</strong> " + event.getFailureReason() + "</li>" +
				"</ul>" +
				"<p>Please try again with a different payment method or contact our support team for assistance.</p>" +
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
