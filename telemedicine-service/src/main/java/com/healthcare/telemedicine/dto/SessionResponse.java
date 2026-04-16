package com.healthcare.telemedicine.dto;

import com.healthcare.telemedicine.model.VideoSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionResponse {

	private String sessionId;
	private String appointmentId;
	private String roomName;
	private String joinUrl;
	private String status;
	private LocalDateTime createdAt;
	private LocalDateTime startedAt;
	private LocalDateTime endedAt;
	private Long durationMinutes;

	public static SessionResponse fromEntity(VideoSession session) {
		return SessionResponse.builder()
				.sessionId(session.getId())
				.appointmentId(session.getAppointmentId())
				.roomName(session.getRoomName())
				.joinUrl(session.getJoinUrl())
				.status(session.getStatus().name())
				.createdAt(session.getCreatedAt())
				.startedAt(session.getStartedAt())
				.endedAt(session.getEndedAt())
				.durationMinutes(session.getDurationMinutes())
				.build();
	}

}