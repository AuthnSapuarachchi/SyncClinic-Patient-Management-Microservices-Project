package com.healthcare.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notification_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog {

	@Id
	private String id;

	private String userId;
	private String recipientEmail;
	private String recipientPhone;
	private NotificationType type;
	private EventType eventType;
	private String subject;
	private String message;
	private NotificationStatus status;
	private LocalDateTime sentAt;
	private String errorMessage;

	public enum NotificationType {
		EMAIL,
		SMS
	}

	public enum EventType {
		APPOINTMENT_BOOKED,
		APPOINTMENT_CANCELLED,
		CONSULTATION_COMPLETED,
		PAYMENT_SUCCESS,
		PAYMENT_FAILED
	}

	public enum NotificationStatus {
		SENT,
		FAILED
	}

}
