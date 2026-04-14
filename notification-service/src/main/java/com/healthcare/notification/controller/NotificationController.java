package com.healthcare.notification.controller;

import com.healthcare.notification.dto.response.ApiResponse;
import com.healthcare.notification.dto.response.NotificationLogResponse;
import com.healthcare.notification.model.NotificationLog;
import com.healthcare.notification.repository.NotificationLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class NotificationController {

	@Autowired
	private NotificationLogRepository notificationLogRepository;

	@GetMapping(value = "/{userId}", params = "!type")
	public ResponseEntity<ApiResponse<List<NotificationLogResponse>>> getNotificationsByUserId(
			@PathVariable String userId) {
		log.info("Getting notifications for user: {}", userId);

		List<NotificationLog> logs = notificationLogRepository.findByUserIdOrderBySentAtDesc(userId);
		List<NotificationLogResponse> responses = logs.stream()
				.map(NotificationLogResponse::fromEntity)
				.collect(Collectors.toList());

		return ResponseEntity
				.status(HttpStatus.OK)
				.body(ApiResponse.success("Notifications retrieved successfully", responses));
	}

	@GetMapping(value = "/{userId}", params = "type")
	public ResponseEntity<ApiResponse<List<NotificationLogResponse>>> getNotificationsByUserIdAndType(
			@PathVariable String userId,
			@RequestParam String type) {
		log.info("Getting notifications for user: {} with type: {}", userId, type);

		NotificationLog.NotificationType notificationType = NotificationLog.NotificationType.valueOf(type.toUpperCase());
		List<NotificationLog> logs = notificationLogRepository.findByUserIdAndTypeOrderBySentAtDesc(userId,
				notificationType);
		List<NotificationLogResponse> responses = logs.stream()
				.map(NotificationLogResponse::fromEntity)
				.collect(Collectors.toList());

		return ResponseEntity
				.status(HttpStatus.OK)
				.body(ApiResponse.success("Notifications retrieved successfully", responses));
	}

	@GetMapping("/recent")
	public ResponseEntity<ApiResponse<List<NotificationLogResponse>>> getRecentNotifications(
			@RequestParam(defaultValue = "10") int limit) {
		log.info("Getting {} recent notifications", limit);

		List<NotificationLog> allLogs = notificationLogRepository.findAll(
				PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "sentAt"))).getContent();

		List<NotificationLogResponse> responses = allLogs.stream()
				.map(NotificationLogResponse::fromEntity)
				.collect(Collectors.toList());

		return ResponseEntity
				.status(HttpStatus.OK)
				.body(ApiResponse.success("Recent notifications retrieved successfully", responses));
	}

}
