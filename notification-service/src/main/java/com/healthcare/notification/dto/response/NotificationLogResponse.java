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
				.type(log.getType().name())
				.eventType(log.getEventType().name())
				.subject(log.getSubject())
				.message(log.getMessage())
				.status(log.getStatus().name())
				.sentAt(log.getSentAt())
				.errorMessage(log.getErrorMessage())
				.build();
	}

}
