# Telemedicine Service Overview

## Purpose
The Telemedicine Service manages online consultation sessions between doctor and patient.
It creates and tracks video sessions using Jitsi Meet links.

## Main Responsibilities
- Create a video session when an appointment is confirmed
- Generate a unique room name and join URL
- Track consultation session lifecycle
- Store session records in MongoDB
- Publish completion events for downstream services (like Notification Service)

## Session Lifecycle
- WAITING: session created, consultation not started
- ACTIVE: consultation in progress
- COMPLETED: consultation ended
- CANCELLED: consultation cancelled

## Core Components
- TelemedicineConsumer: listens for appointment confirmation events
- SessionService: creates/starts/ends sessions and applies business rules
- SessionController: REST APIs for session operations
- VideoSessionRepository: MongoDB persistence for session records
- TelemedicinePublisher: publishes follow-up events (for example consultation completed)

## API Endpoints
Base path: `/telemedicine-service/api/sessions`

- `POST /create`: manually create a session
- `GET /{appointmentId}`: get session details by appointment
- `PUT /{appointmentId}/start`: mark session as started
- `DELETE /{appointmentId}/end`: end session and trigger completion actions
- `GET /doctor/{doctorId}`: list sessions for a doctor
- `GET /patient/{patientId}`: list sessions for a patient

## Data and Integrations
- Database: MongoDB
- Message broker: RabbitMQ
- Video platform: Jitsi Meet (`https://meet.jit.si`)

## Typical Flow
1. Appointment Service publishes AppointmentConfirmed event.
2. TelemedicineConsumer receives the event.
3. SessionService creates a VideoSession and Jitsi join URL.
4. Session is stored in MongoDB with WAITING status.
5. Doctor starts session -> status becomes ACTIVE.
6. Session ends -> status becomes COMPLETED and completion event is published.
7. Notification Service can consume completion event and notify users.

## Why This Service Exists
- Isolates telemedicine logic from appointment and notification domains
- Supports asynchronous, scalable consultation workflows
- Keeps complete consultation session history for audit and reporting
