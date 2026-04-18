# Healthcare Telemedicine Platform - Microservices Build

## Overview
This document summarizes the production-ready Spring Boot microservices created for the Healthcare Telemedicine Platform.

## Services Built

### 1. Telemedicine Service (Port 8083)
Manages Jitsi Meet video session rooms for doctor-patient consultations.

**Key Features:**
- Auto-creates video rooms when appointments are confirmed
- Tracks session lifecycle (WAITING → IN_PROGRESS → COMPLETED)
- Publishes consultation completion events with session metrics
- REST API for manual session management

**Technology:**
- Spring Boot 3.2
- Spring Data MongoDB
- Spring AMQP
- Jitsi Meet URL generation

**Directory Structure:**
```
telemedicine-service/
├── src/main/java/com/healthcare/telemedicine/
│   ├── TelemedicineServiceApplication.java
│   ├── config/
│   │   ├── RabbitMQConfig.java
│   │   └── CorsConfig.java
│   ├── controller/SessionController.java
│   ├── service/SessionService.java
│   ├── consumer/TelemedicineConsumer.java
│   ├── publisher/TelemedicinePublisher.java
│   ├── model/VideoSession.java
│   ├── dto/
│   │   ├── request/CreateSessionRequest.java
│   │   ├── response/SessionResponse.java
│   │   └── events/
│   │       ├── AppointmentConfirmedEvent.java
│   │       └── ConsultationCompletedEvent.java
│   ├── repository/VideoSessionRepository.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   └── ApiErrorResponse.java
│   └── dto/response/ApiResponse.java
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── Dockerfile
```

**REST API Endpoints:**
```
POST   /api/sessions/create                        - Create new session
GET    /api/sessions/{appointmentId}               - Get session details
PUT    /api/sessions/{appointmentId}/start         - Mark session as started
DELETE /api/sessions/{appointmentId}/end           - End session & publish event
GET    /api/sessions/doctor/{doctorId}             - Get doctor's sessions
GET    /api/sessions/patient/{patientId}           - Get patient's sessions
GET    /api/sessions/active                        - Get all active sessions
```

**RabbitMQ Configuration:**
- **Consumes**: `appointment.confirmed` queue with routing key `appointment.confirmed`
- **Publishes**: `consultation.completed` queue with routing key `consultation.completed`
- **Exchange**: `healthcare.exchange` (TopicExchange)

---

### 2. Notification Service (Port 8085)
Sends email and SMS notifications for healthcare events.

**Key Features:**
- Listens to 5 different event queues
- Sends professional HTML emails via Gmail SMTP
- Sends SMS notifications via Twilio
- Maintains audit trail of all notifications in MongoDB
- Event-driven architecture (no outbound REST calls)

**Technology:**
- Spring Boot 3.2
- Spring Data MongoDB
- Spring AMQP
- JavaMailSender (Gmail SMTP)
- Twilio SDK 9.14.0

**Directory Structure:**
```
notification-service/
├── src/main/java/com/healthcare/notification/
│   ├── NotificationServiceApplication.java
│   ├── config/
│   │   ├── RabbitMQConfig.java
│   │   └── TwilioConfig.java
│   ├── controller/NotificationController.java
│   ├── consumer/NotificationConsumer.java
│   ├── handler/
│   │   ├── AppointmentNotificationHandler.java
│   │   ├── AppointmentCancellationHandler.java
│   │   ├── ConsultationNotificationHandler.java
│   │   └── PaymentNotificationHandler.java
│   ├── service/
│   │   ├── EmailService.java
│   │   └── SmsService.java
│   ├── model/NotificationLog.java
│   ├── dto/
│   │   ├── events/
│   │   │   ├── AppointmentBookedEvent.java
│   │   │   ├── AppointmentCancelledEvent.java
│   │   │   ├── ConsultationCompletedEvent.java
│   │   │   ├── PaymentSuccessEvent.java
│   │   │   └── PaymentFailedEvent.java
│   │   └── response/
│   │       ├── ApiResponse.java
│   │       └── NotificationLogResponse.java
│   ├── repository/NotificationLogRepository.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   └── ApiErrorResponse.java
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── Dockerfile
```

**REST API Endpoints:**
```
GET    /api/notifications/{userId}                  - Get user's all notifications
GET    /api/notifications/{userId}?type=EMAIL       - Filter by type (EMAIL or SMS)
GET    /api/notifications/recent?limit=10           - Get N most recent notifications
```

**RabbitMQ Queues Consumed:**
1. `appointment.booked` → Sends confirmation emails/SMS to patient & doctor
2. `appointment.cancelled` → Sends cancellation emails/SMS to patient & doctor
3. `consultation.completed` → Sends summary email/SMS to patient
4. `payment.success` → Sends receipt email/SMS to patient
5. `payment.failed` → Sends retry alert email/SMS to patient

**Email Templates Included:**
- Appointment Confirmed (patient & doctor variants)
- Appointment Cancelled (patient & doctor variants)
- Consultation Complete with prescription link
- Payment Success with transaction details
- Payment Failed with retry instructions

---

## Infrastructure Setup

### Docker Compose Services
The `docker-compose.yml` includes:

**Databases:**
- **PostgreSQL**: Existing database for auth/core services
- **MongoDB** (Port 27017): Telemedicine & Notification services
  - Admin credentials: admin/admin123
  
**Message Brokers:**
- **RabbitMQ** (Port 5672/15672): 
  - Management UI: http://localhost:15672 (guest/guest)
  - Connected to both telemedicine and notification services
- **Kafka** (Port 9092): Existing broker

**Microservices:**
- **Telemedicine Service** (Port 8083)
- **Notification Service** (Port 8085)

All services are connected via `healthcare-network` bridge network.

---

## Running the Services

### Prerequisites
- Java 17
- Maven 3.8+
- Docker & Docker Compose
- Gmail account with app password (for email)
- Twilio account credentials (for SMS)

### Build & Run

**1. Build all services:**
```bash
docker-compose up --build
```

**2. Environment Variables for Notification Service:**
Create a `.env` file in the project root:
```
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

**3. Verify Services:**
```bash
# Check RabbitMQ management UI
curl http://localhost:15672 (admin/guest)

# Check MongoDB
mongosh mongodb://admin:admin123@localhost:27017

# Test Telemedicine Service
curl http://localhost:8083/telemedicine-service/api/sessions/active

# Test Notification Service
curl http://localhost:8085/notification-service/api/notifications/recent
```

---

## Key Design Decisions

### 1. Message Serialization
- All messages use `Jackson2JsonMessageConverter` for JSON serialization
- Ensures compatibility across all services using the shared exchange

### 2. Database Choice
- **MongoDB** for both services (vs PostgreSQL) for:
  - Flexible schema (notification types vary)
  - Fast write-heavy operations (logging notifications)
  - Horizontal scaling capability

### 3. Async Communication
- RabbitMQ TopicExchange with routing keys for decoupled services
- Services can scale independently without REST call chains
- Messages retry on failure (configurable in RabbitMQ)

### 4. Error Handling
- Global `@RestControllerAdvice` exception handlers in both services
- Try-catch wrapping around Twilio/Email for graceful degradation
- Failed notifications logged in MongoDB with error details
- HTTP status codes follow REST conventions (201 for create, 404 for not found)

### 5. API Response Wrapper
All REST responses wrapped in standardized format:
```json
{
  "success": true,
  "message": "Operation completed",
  "data": {...},
  "timestamp": "2024-01-15T10:30:00"
}
```

### 6. Logging
- `@Slf4j` annotation used throughout both services
- Log levels: INFO for major events, DEBUG for detailed traces
- Configurable via `application.properties`

---

## Deployment Checklist

- [ ] Configure Gmail SMTP credentials
- [ ] Set up Twilio account and purchase phone number
- [ ] Update MongoDB credentials if needed
- [ ] Update RabbitMQ credentials if needed
- [ ] Test all email templates with real Gmail account
- [ ] Test SMS delivery with Twilio
- [ ] Configure alerting for failed notifications
- [ ] Set up MongoDB backups
- [ ] Set up RabbitMQ message persistence
- [ ] Configure resource limits in docker-compose
- [ ] Test failover scenarios
- [ ] Set up monitoring for both services

---

## Troubleshooting

### RabbitMQ Connection Issues
- Check if RabbitMQ container is running: `docker ps | grep rabbitmq`
- Check logs: `docker logs syncclinic-rabbitmq`
- Verify health: `curl -u guest:guest http://localhost:15672/api/aliveness-test/%2F`

### MongoDB Connection Issues
- Check if MongoDB container is running: `docker ps | grep mongodb`
- Test connection: `mongosh mongodb://admin:admin123@localhost:27017`

### Email Not Sending
- Verify Gmail credentials and app-specific password
- Check SMTP settings in application.properties
- Review service logs: `docker logs syncclinic-notification`

### SMS Not Sending
- Verify Twilio account SID, auth token, and phone number
- Check Twilio console for error messages
- Ensure recipient phone number is in proper format

---

## Future Enhancements
- Message retry logic with exponential backoff
- Dead letter queues for failed messages
- Notification preference management per user
- Template management system for dynamic emails
- Analytics dashboard for notification metrics
- Rate limiting for SMS to prevent costly overages
- Multi-language support for notifications
