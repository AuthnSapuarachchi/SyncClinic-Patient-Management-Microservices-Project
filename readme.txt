SyncClinic Patient Management Microservices Project
Deployment Steps

1. Prerequisites
- Install Docker Desktop and Docker Compose.
- Install Java 17 and Maven 3.8+ if you want to run services locally.
- Install Node.js 18+ if you want to run the frontend locally.
- Create valid Gmail SMTP credentials or app password for email notifications.
- Create valid Twilio credentials and a Twilio phone number for SMS notifications.

2. Configure Environment Variables
Set the following values before starting the system:
- MAIL_USERNAME
- MAIL_PASSWORD
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- PATIENT_SERVICE_URL
- DOCTOR_SERVICE_URL
- MONGO_URI if you want to override the default MongoDB connection string

If you use Docker Compose, these are already mapped in docker-compose.yml and can be overridden in a .env file.

3. Start the Infrastructure Services
From the project root, start the shared dependencies first:
- PostgreSQL
- MongoDB
- RabbitMQ
- Kafka
- Service Registry

Recommended command:
- docker compose up -d postgres-db mongodb rabbitmq kafka service-registry

4. Build and Start the Microservices
Start the backend services after the infrastructure is healthy:
- identity-service
- patient-service
- doctor-service
- appointment-service
- payment-service
- telemedicine-service
- notification-service
- ai-symptoms-service
- api-gateway

Recommended command:
- docker compose up -d --build

If you want to run a service locally instead of Docker, compile it first and then run it with Maven:
- mvn -DskipTests compile
- mvn spring-boot:run

5. Build and Start the Frontend
Go to the frontend folder and install dependencies if needed:
- cd sync-clinic-frontend
- npm install

Start the frontend in development mode:
- npm run dev

For production build:
- npm run build

6. Verify the System
Check that these services are running:
- API Gateway on port 8080
- Identity Service on port 8081
- Patient Service on port 8082
- Doctor Service on port 8083
- Appointment Service on port 8084
- Notification Service on port 8085
- Payment Service on port 8086
- Telemedicine Service on port 8087
- AI Symptoms Service on port 8088
- RabbitMQ Management UI on http://localhost:15672
- Frontend on the Vite port shown in the terminal

7. Test the Notification Flow
The notification flow depends on RabbitMQ, MongoDB, SMTP, and Twilio.

Appointment notification test:
- Create an appointment through the UI or publish an appointment.booked event.
- Confirm that notification-service receives the event.
- Check notification history in the Notification Center page.

Payment notification test:
- Complete a payment or publish payment.success / payment.failed events.
- Confirm email and SMS logs are created.

Consultation notification test:
- End a telemedicine session.
- Confirm consultation.completed is published and processed.

8. Check Notification History in UI
Open the patient dashboard and use:
- View Notification History

This should load the Notification Center page and show:
- My Notification History
- Recent System Notifications
- EMAIL or SMS filters

9. Useful Health Checks
- RabbitMQ UI: http://localhost:15672
- Notification API recent logs:
  /notification-service/api/notifications/recent?limit=10
- Patient notifications:
  /notification-service/api/notifications/{userId}

10. Stop the System
To stop all containers:
- docker compose down

To remove volumes as well:
- docker compose down -v

Notes
- Email notifications use Spring Mail with SMTP.
- SMS notifications use Twilio.
- Notification logs are stored in MongoDB.
- Appointment and payment events now publish to RabbitMQ for notification delivery.
- The frontend includes a Notification Center page for reviewing delivery history.
