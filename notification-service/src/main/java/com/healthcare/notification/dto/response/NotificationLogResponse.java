package com.healthcare.notification.dto.response;

import com.healthcare.notification.model.NotificationLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLogResponse {

	private String id;
	private String userId;
	private String recipientEmail;
	private String recipientPhone;
	private String type;
	private String eventType;
	private String subject;
	private String message;
	private String status;
	private LocalDateTime sentAt;
	private String errorMessage;

	public static NotificationLogResponse fromEntity(NotificationLog log) {
		return NotificationLogResponse.builder()
				.id(log.getId())
				.userId(log.getUserId())
				.recipientEmail(log.getRecipientEmail())
				.recipientPhone(log.getRecipientPhone())
				.type(enumName(log.getType()))
				.eventType(enumName(log.getEventType()))
				.subject(log.getSubject())
				.message(log.getMessage())
				.status(enumName(log.getStatus()))
				.sentAt(log.getSentAt())
				.errorMessage(log.getErrorMessage())
				.build();
	}

	private static String enumName(Enum<?> value) {
		return value != null ? value.name() : null;
	}

}
