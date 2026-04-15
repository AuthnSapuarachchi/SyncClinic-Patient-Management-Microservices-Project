package com.SyncClinic.payment_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
 
@Configuration
public class KafkaConfig {
 
    @Value("${kafka.topic.payment-success}")
    private String paymentSuccessTopic;
 
    @Value("${kafka.topic.payment-failed}")
    private String paymentFailedTopic;
 
    // Auto-creates the topics in Kafka if they don't exist yet
    @Bean
    public NewTopic paymentSuccessTopic() {
        return TopicBuilder.name(paymentSuccessTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }
 
    @Bean
    public NewTopic paymentFailedTopic() {
        return TopicBuilder.name(paymentFailedTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
 