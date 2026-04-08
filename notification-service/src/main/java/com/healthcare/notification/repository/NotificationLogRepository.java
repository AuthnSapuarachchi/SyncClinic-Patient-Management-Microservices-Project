package com.healthcare.notification.repository;

import com.healthcare.notification.model.NotificationLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends MongoRepository<NotificationLog, String> {

	List<NotificationLog> findByUserIdOrderBySentAtDesc(String userId);

	List<NotificationLog> findByUserIdAndTypeOrderBySentAtDesc(String userId, NotificationLog.NotificationType type);

}
