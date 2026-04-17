package com.healthcare.notification.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "notification_logs")
public class NotificationLog {

    @Id
    private String id;
    private String recipientId;
    private String recipientEmail;
    private String message;
    private String status; // SUCCESS or FAILED
    private LocalDateTime sentAt;
}
