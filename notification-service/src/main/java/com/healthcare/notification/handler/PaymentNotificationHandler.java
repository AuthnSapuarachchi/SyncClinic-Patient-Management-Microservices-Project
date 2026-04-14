package com.healthcare.notification.handler;

import com.healthcare.notification.dto.events.PaymentFailedEvent;
import com.healthcare.notification.dto.events.PaymentSuccessEvent;
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
public class PaymentNotificationHandler {

	@Autowired
	private EmailService emailService;

	@Autowired
	private SmsService smsService;

	@Autowired
	private NotificationLogRepository notificationLogRepository;

	public void handlePaymentSuccess(PaymentSuccessEvent event) {
		log.info("Handling payment success notification for transaction: {}", event.getTransactionId());

		// Send email to patient
		try {
			String patientEmailSubject = "💳 Payment Confirmed – " + event.getTransactionId();
			String patientEmailBody = buildPaymentSuccessEmail(event);
			emailService.sendHtmlEmail(event.getPatientEmail(), patientEmailSubject, patientEmailBody);

			saveNotificationLog(event.getPatientEmail(), event.getTransactionId(), "EMAIL",
					NotificationLog.EventType.PAYMENT_SUCCESS, patientEmailSubject,
					patientEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send payment success email", e);
			saveNotificationLog(event.getPatientEmail(), event.getTransactionId(), "EMAIL",
					NotificationLog.EventType.PAYMENT_SUCCESS, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to patient
		try {
			String smsBody = "Payment of " + event.getCurrency() + " " + event.getAmount()
					+ " confirmed. Txn: " + event.getTransactionId() + ".";
			smsService.sendSms(event.getPatientPhone(), smsBody);

			saveNotificationLog(event.getPatientPhone(), event.getTransactionId(), "SMS",
					NotificationLog.EventType.PAYMENT_SUCCESS, "SMS",
					smsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send payment success SMS", e);
			saveNotificationLog(event.getPatientPhone(), event.getTransactionId(), "SMS",
					NotificationLog.EventType.PAYMENT_SUCCESS, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		log.info("Payment success notifications sent successfully");
	}

	public void handlePaymentFailed(PaymentFailedEvent event) {
		log.info("Handling payment failed notification for patient: {}", event.getPatientName());

		// Send email to patient
		try {
			String patientEmailSubject = "⚠️ Payment Failed – Action Required";
			String patientEmailBody = buildPaymentFailedEmail(event);
			emailService.sendHtmlEmail(event.getPatientEmail(), patientEmailSubject, patientEmailBody);

			saveNotificationLog(event.getPatientEmail(), event.getPatientEmail(), "EMAIL",
					NotificationLog.EventType.PAYMENT_FAILED, patientEmailSubject,
					patientEmailBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send payment failed email", e);
			saveNotificationLog(event.getPatientEmail(), event.getPatientEmail(), "EMAIL",
					NotificationLog.EventType.PAYMENT_FAILED, "Email",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		// Send SMS to patient
		try {
			String smsBody = "Payment of " + event.getCurrency() + " " + event.getAmount()
					+ " failed. Reason: " + event.getFailureReason() + ". Please retry.";
			smsService.sendSms(event.getPatientPhone(), smsBody);

			saveNotificationLog(event.getPatientPhone(), event.getPatientEmail(), "SMS",
					NotificationLog.EventType.PAYMENT_FAILED, "SMS",
					smsBody, NotificationLog.NotificationStatus.SENT, null);
		} catch (Exception e) {
			log.error("Failed to send payment failed SMS", e);
			saveNotificationLog(event.getPatientPhone(), event.getPatientEmail(), "SMS",
					NotificationLog.EventType.PAYMENT_FAILED, "SMS",
					"Failed to send", NotificationLog.NotificationStatus.FAILED, e.getMessage());
		}

		log.info("Payment failed notifications sent successfully");
	}

	private String buildPaymentSuccessEmail(PaymentSuccessEvent event) {
		return "<html><body>" +
				"<h2>💳 Payment Confirmed</h2>" +
				"<p>Dear " + event.getPatientName() + ",</p>" +
				"<p>Your payment has been successfully processed. Here are the details:</p>" +
				"<ul>" +
				"<li><strong>Transaction ID:</strong> " + event.getTransactionId() + "</li>" +
				"<li><strong>Amount:</strong> " + event.getCurrency() + " " + event.getAmount() + "</li>" +
				"<li><strong>Payment Method:</strong> " + event.getPaymentMethod() + "</li>" +
				"<li><strong>Doctor:</strong> Dr. " + event.getDoctorName() + "</li>" +
				"</ul>" +
				"<p>Thank you for using SyncClinic. Your consultation can now proceed.</p>" +
				"<p>Best regards,<br/>SyncClinic Team</p>" +
				"</body></html>";
	}

	private String buildPaymentFailedEmail(PaymentFailedEvent event) {
		return "<html><body>" +
				"<h2>⚠️ Payment Failed</h2>" +
				"<p>Dear " + event.getPatientName() + ",</p>" +
				"<p>Unfortunately, your payment could not be processed. Please review and retry:</p>" +
				"<ul>" +
				"<li><strong>Amount:</strong> " + event.getCurrency() + " " + event.getAmount() + "</li>" +
				"<li><strong>Reason:</strong> " + event.getFailureReason() + "</li>" +
				"</ul>" +
				"<p>Please try again with a different payment method or contact our support team for assistance.</p>" +
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
