package com.healthcare.telemedicine.controller;

import com.healthcare.telemedicine.dto.CreateSessionRequest;
import com.healthcare.telemedicine.dto.ApiResponse;
import com.healthcare.telemedicine.dto.SessionResponse;
import com.healthcare.telemedicine.service.SessionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@Slf4j
public class SessionController {

	@Autowired
	private SessionService sessionService;

	@PostMapping("/create")
	public ResponseEntity<ApiResponse<SessionResponse>> createSession(
			@RequestBody CreateSessionRequest request) {
		log.info("Creating session for appointment: {}", request.getAppointmentId());

		SessionResponse response = sessionService.createSessionManually(
				request.getAppointmentId(),
				request.getPatientId(),
				request.getPatientName(),
				request.getDoctorId(),
				request.getDoctorName());

		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Session created successfully", response));
	}

	@GetMapping("/{appointmentId}")
	public ResponseEntity<ApiResponse<SessionResponse>> getSession(
			@PathVariable String appointmentId) {
		log.info("Getting session for appointment: {}", appointmentId);

		SessionResponse response = sessionService.getSessionByAppointmentId(appointmentId);

		return ResponseEntity
				.status(HttpStatus.OK)
				.body(ApiResponse.success("Session retrieved successfully", response));
	}

	@PutMapping("/{appointmentId}/start")
	public ResponseEntity<ApiResponse<SessionResponse>> startSession(
			@PathVariable String appointmentId) {
		log.info("Starting session for appointment: {}", appointmentId);

		SessionResponse response = sessionService.startSession(appointmentId);

		return ResponseEntity
				.status(HttpStatus.OK)
				.body(ApiResponse.success("Session started successfully", response));
	}

	@DeleteMapping("/{appointmentId}/end")
	public ResponseEntity<ApiResponse<SessionResponse>> endSession(
			@PathVariable String appointmentId,
			@RequestParam String patientEmail,
			@RequestParam String patientPhone,
			@RequestParam String doctorEmail,
			@RequestParam(required = false) String prescriptionUrl) {
		log.info("Ending session for appointment: {}", appointmentId);

		SessionResponse response = sessionService.endSession(
				appointmentId,
				patientEmail,
				patientPhone,
				doctorEmail,
				prescriptionUrl);

		return ResponseEntity
				.status(HttpStatus.OK)
				.body(ApiResponse.success("Session ended successfully", response));
	}

	@GetMapping("/doctor/{doctorId}")
	public ResponseEntity<ApiResponse<List<SessionResponse>>> getSessionsByDoctorId(
			@PathVariable String doctorId,
			@RequestParam(required = false) String status) {
		log.info("Getting sessions for doctor: {} with status: {}", doctorId, status);

		List<SessionResponse> responses = sessionService.getSessionsByDoctorId(doctorId, status);

		return ResponseEntity
				.status(HttpStatus.OK)
				.body(ApiResponse.success("Sessions retrieved successfully", responses));
	}

	@GetMapping("/patient/{patientId}")
	public ResponseEntity<ApiResponse<List<SessionResponse>>> getSessionsByPatientId(
			@PathVariable String patientId) {
		log.info("Getting sessions for patient: {}", patientId);

		List<SessionResponse> responses = sessionService.getSessionsByPatientId(patientId);

		return ResponseEntity
				.status(HttpStatus.OK)
				.body(ApiResponse.success("Sessions retrieved successfully", responses));
	}

	@GetMapping("/active")
	public ResponseEntity<ApiResponse<List<SessionResponse>>> getActiveSessions() {
		log.info("Getting all active sessions");

		List<SessionResponse> responses = sessionService.getActiveSessions();

		return ResponseEntity
				.status(HttpStatus.OK)
				.body(ApiResponse.success("Active sessions retrieved successfully", responses));
	}

}
