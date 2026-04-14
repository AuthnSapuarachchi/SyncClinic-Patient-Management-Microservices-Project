package com.healthcare.telemedicine.service;

import com.healthcare.telemedicine.dto.events.AppointmentConfirmedEvent;
import com.healthcare.telemedicine.dto.events.ConsultationCompletedEvent;
import com.healthcare.telemedicine.dto.response.SessionResponse;
import com.healthcare.telemedicine.model.VideoSession;
import com.healthcare.telemedicine.publisher.TelemedicinePublisher;
import com.healthcare.telemedicine.repository.VideoSessionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SessionService {

	@Autowired
	private VideoSessionRepository videoSessionRepository;

	@Autowired
	private TelemedicinePublisher telemedicinePublisher;

	@Value("${jitsi.base-url:https://meet.jit.si}")
	private String jitsiBaseUrl;

	public SessionResponse createSession(AppointmentConfirmedEvent event) {
		log.info("Creating video session for appointment: {}", event.getAppointmentId());

		String roomName = generateRoomName(event.getAppointmentId());
		String joinUrl = generateJoinUrl(roomName);

		VideoSession session = VideoSession.builder()
				.appointmentId(event.getAppointmentId())
				.patientId(event.getPatientId())
				.patientName(event.getPatientName())
				.doctorId(event.getDoctorId())
				.doctorName(event.getDoctorName())
				.roomName(roomName)
				.joinUrl(joinUrl)
				.status(VideoSession.SessionStatus.WAITING)
				.createdAt(LocalDateTime.now())
				.build();

		VideoSession savedSession = videoSessionRepository.save(session);
		log.info("Video session created with ID: {}", savedSession.getId());

		return SessionResponse.fromEntity(savedSession);
	}

	public SessionResponse createSessionManually(String appointmentId, String patientId, String patientName,
			String doctorId, String doctorName) {
		log.info("Creating video session manually for appointment: {}", appointmentId);

		String roomName = generateRoomName(appointmentId);
		String joinUrl = generateJoinUrl(roomName);

		VideoSession session = VideoSession.builder()
				.appointmentId(appointmentId)
				.patientId(patientId)
				.patientName(patientName)
				.doctorId(doctorId)
				.doctorName(doctorName)
				.roomName(roomName)
				.joinUrl(joinUrl)
				.status(VideoSession.SessionStatus.WAITING)
				.createdAt(LocalDateTime.now())
				.build();

		VideoSession savedSession = videoSessionRepository.save(session);
		log.info("Video session created with ID: {}", savedSession.getId());

		return SessionResponse.fromEntity(savedSession);
	}

	public SessionResponse getSessionByAppointmentId(String appointmentId) {
		log.debug("Fetching session for appointment: {}", appointmentId);

		VideoSession session = videoSessionRepository.findByAppointmentId(appointmentId)
				.orElseThrow(() -> {
					log.warn("Session not found for appointment: {}", appointmentId);
					return new RuntimeException("Session not found for appointment: " + appointmentId);
				});

		return SessionResponse.fromEntity(session);
	}

	public SessionResponse startSession(String appointmentId) {
		log.info("Starting session for appointment: {}", appointmentId);

		VideoSession session = videoSessionRepository.findByAppointmentId(appointmentId)
				.orElseThrow(() -> new RuntimeException("Session not found for appointment: " + appointmentId));

		session.setStatus(VideoSession.SessionStatus.IN_PROGRESS);
		session.setStartedAt(LocalDateTime.now());

		VideoSession updatedSession = videoSessionRepository.save(session);
		log.info("Session started for appointment: {}", appointmentId);

		return SessionResponse.fromEntity(updatedSession);
	}

	public SessionResponse endSession(String appointmentId, String patientEmail, String patientPhone,
			String doctorEmail, String prescriptionUrl) {
		log.info("Ending session for appointment: {}", appointmentId);

		VideoSession session = videoSessionRepository.findByAppointmentId(appointmentId)
				.orElseThrow(() -> new RuntimeException("Session not found for appointment: " + appointmentId));

		LocalDateTime endedAt = LocalDateTime.now();
		session.setStatus(VideoSession.SessionStatus.COMPLETED);
		session.setEndedAt(endedAt);

		if (session.getStartedAt() != null) {
			long durationMinutes = java.time.temporal.ChronoUnit.MINUTES
					.between(session.getStartedAt(), endedAt);
			session.setDurationMinutes(durationMinutes);
		}

		VideoSession updatedSession = videoSessionRepository.save(session);
		log.info("Session ended for appointment: {}. Duration: {} minutes", appointmentId,
				session.getDurationMinutes());

		// Publish consultation completed event
		ConsultationCompletedEvent event = ConsultationCompletedEvent.builder()
				.appointmentId(session.getAppointmentId())
				.patientId(session.getPatientId())
				.patientName(session.getPatientName())
				.patientEmail(patientEmail)
				.patientPhone(patientPhone)
				.doctorId(session.getDoctorId())
				.doctorName(session.getDoctorName())
				.doctorEmail(doctorEmail)
				.sessionDuration(session.getDurationMinutes())
				.prescriptionUrl(prescriptionUrl)
				.build();

		telemedicinePublisher.publishConsultationCompleted(event);
		log.info("Consultation completed event published for appointment: {}", appointmentId);

		return SessionResponse.fromEntity(updatedSession);
	}

	public List<SessionResponse> getSessionsByDoctorId(String doctorId, String status) {
		log.debug("Fetching sessions for doctor: {} with status: {}", doctorId, status);

		List<VideoSession> sessions;

		if (status != null && !status.isEmpty()) {
			VideoSession.SessionStatus sessionStatus = VideoSession.SessionStatus.valueOf(status.toUpperCase());
			sessions = videoSessionRepository.findByDoctorIdAndStatus(doctorId, sessionStatus);
		} else {
			sessions = videoSessionRepository.findByDoctorId(doctorId);
		}

		return sessions.stream()
				.map(SessionResponse::fromEntity)
				.collect(Collectors.toList());
	}

	public List<SessionResponse> getSessionsByPatientId(String patientId) {
		log.debug("Fetching sessions for patient: {}", patientId);

		List<VideoSession> sessions = videoSessionRepository.findByPatientId(patientId);

		return sessions.stream()
				.map(SessionResponse::fromEntity)
				.collect(Collectors.toList());
	}

	public List<SessionResponse> getActiveSessions() {
		log.debug("Fetching all active sessions");

		List<VideoSession> sessions = videoSessionRepository
				.findByStatus(VideoSession.SessionStatus.IN_PROGRESS);

		return sessions.stream()
				.map(SessionResponse::fromEntity)
				.collect(Collectors.toList());
	}

	private String generateRoomName(String appointmentId) {
		String uuid = UUID.randomUUID().toString().substring(0, 8);
		return "healthcare-" + appointmentId + "-" + uuid;
	}

	private String generateJoinUrl(String roomName) {
		return jitsiBaseUrl + "/" + roomName;
	}

}
