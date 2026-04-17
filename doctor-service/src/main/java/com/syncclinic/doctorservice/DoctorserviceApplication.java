package com.syncclinic.doctorservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

// Main entry point for the Doctor Service application
@SpringBootApplication
public class DoctorserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoctorserviceApplication.class, args);
    }

    @Bean
    public org.springframework.boot.CommandLineRunner loadTestData(com.syncclinic.doctorservice.repository.DoctorRepository repository) {
        return args -> {
            // Only add data if the database is completely empty
            if (repository.count() == 0) {
                System.out.println("No doctors found! Seeding database...");

                // Using your Lombok @Builder to safely create Doctor 1
                com.syncclinic.doctorservice.model.Doctor doc1 = com.syncclinic.doctorservice.model.Doctor.builder()
                        .fullName("Dr. John Smith")
                        .email("john.smith@syncclinic.com")
                        .phone("+1234567890")
                        .specialty("Neurologist")
                        .hospital("SyncClinic General")
                        .qualification("MD, PhD")
                        .experienceYears(15)
                        .bio("Senior Neurologist specializing in brain and nervous system disorders.")
                        // Note: Change 'ACTIVE' to whatever your DoctorStatus enum actually uses (e.g., VERIFIED, APPROVED)
                        // .status(com.syncclinic.doctorservice.model.DoctorStatus.ACTIVE)
                        .build();

                // Using your Lombok @Builder to create Doctor 2
                com.syncclinic.doctorservice.model.Doctor doc2 = com.syncclinic.doctorservice.model.Doctor.builder()
                        .fullName("Dr. Emily Chen")
                        .email("emily.chen@syncclinic.com")
                        .phone("+0987654321")
                        .specialty("Pediatrician")
                        .hospital("SyncClinic Pediatrics")
                        .qualification("MD")
                        .experienceYears(8)
                        .bio("Dedicated pediatrician with a passion for children's healthcare.")
                        // .status(com.syncclinic.doctorservice.model.DoctorStatus.ACTIVE)
                        .build();

                // Save them to PostgreSQL
                repository.save(doc1);
                repository.save(doc2);

                System.out.println("Test doctors loaded successfully!");
            }
        };
    }

}