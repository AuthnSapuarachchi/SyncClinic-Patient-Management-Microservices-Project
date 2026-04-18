package com.healthcare.telemedicine.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "video_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoSession {

	@Id
	private String id;

	private String appointmentId;
	private String patientId;
	private String patientName;
	private String doctorId;
	private String doctorName;
	private String roomName;
	private String joinUrl;
	private SessionStatus status;
	private LocalDateTime createdAt;
	private LocalDateTime startedAt;
	private LocalDateTime endedAt;
	private Long durationMinutes;

	public enum SessionStatus {
		REQUESTED,
		ACCEPTED,
		WAITING,
		IN_PROGRESS,
		COMPLETED,
		CANCELLED
	}

}
