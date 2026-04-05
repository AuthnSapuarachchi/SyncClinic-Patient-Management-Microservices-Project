package com.SyncClinic.patient_service.service;

<<<<<<< HEAD
import com.SyncClinic.patient_service.entity.Patient;
import com.SyncClinic.patient_service.repository.PatientRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class PatientKafkaConsumer {
    @Autowired
    private PatientRepository patientRepository;

    // Jackson ObjectMapper is Spring's default tool for cracking open JSON strings
    @Autowired
    private ObjectMapper objectMapper;

    // This annotation tells Spring to constantly listen to this exact topic!
    @KafkaListener(topics = "user-registration-events", groupId = "patient-group")
    public void consumeRegistrationEvent(String message) {
        try {
            System.out.println("🔔 KAFKA EVENT RECEIVED: " + message);

            // 1. Crack open the JSON string to get the email
            JsonNode jsonNode = objectMapper.readTree(message);
            String email = jsonNode.get("email").asText();

            // 2. Check if a patient with this email already exists (just to be safe!)
            if (patientRepository.findByEmail(email).isEmpty()) {

                // 3. Create a blank patient profile linked to that email!
                Patient newPatient = Patient.builder()
                        .email(email)
                        .firstName("Pending") // You can ask the user to update this later in the UI
                        .lastName("Pending")
                        .build();

                patientRepository.save(newPatient);
                System.out.println("✅ Blank patient profile created for: " + email);
            } else {
                System.out.println("⚠️ Patient profile already exists for: " + email);
            }

        } catch (Exception e) {
            System.err.println("❌ Error processing Kafka message: " + e.getMessage());
        }
    }
=======
public class PatientKafkaConsumer {
>>>>>>> 5a20b6e (api gatway setup and set the security and service registry setup and register servicess in one phone book)
}
