package com.healthcare.notification.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@Document(collection = "notification_logs")
public class NotificationLog {

    @Id
    private String id;
    private String recipientEmail;
    private String messageBody;
    private String status; // "SENT" or "FAILED"
    private LocalDateTime timestamp;
}
