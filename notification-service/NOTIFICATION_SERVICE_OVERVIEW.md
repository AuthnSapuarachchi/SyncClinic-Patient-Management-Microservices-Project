# Notification Service Overview

## Purpose
The Notification Service is responsible for sending communication to users (patients and doctors) through:
- Email notifications
- SMS notifications

It works as an event-driven service by consuming events from RabbitMQ.

## Main Responsibilities
- Listen to business events from other services
- Send email messages using Spring Mail (SMTP)
- Send SMS messages using Twilio
- Store delivery history in MongoDB
- Expose APIs to query notification history

## Events It Handles
- Appointment booked
- Appointment cancelled
- Consultation completed
- Payment success
- Payment failed

## Core Components
- NotificationConsumer: listens to RabbitMQ queues
- AppointmentNotificationHandler / Cancellation / Consultation / Payment handlers: business logic per event
- EmailService: sends email content (HTML/text)
- SmsService: sends SMS content
- NotificationLogRepository: saves and fetches notification logs from MongoDB
- NotificationController: provides REST endpoints for notification history

## API Endpoints
Base path: `/notification-service/api/notifications`

- `GET /{userId}`: get all notifications for a user
- `GET /{userId}?type=EMAIL|SMS`: filter notifications by type
- `GET /recent?limit=10`: get latest notifications

## Data and Integrations
- Database: MongoDB
- Message broker: RabbitMQ
- External providers:
  - SMTP server (email)
  - Twilio (SMS)

## Typical Flow
1. Another microservice publishes an event to RabbitMQ.
2. NotificationConsumer receives the event.
3. The corresponding handler prepares message content.
4. EmailService and/or SmsService sends the notification.
5. The result is stored in NotificationLog as SENT or FAILED.

## Why This Service Exists
- Decouples messaging logic from core business services
- Improves reliability with asynchronous processing
- Centralizes all user communications in one place
- Makes notifications auditable through logs
