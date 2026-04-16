package com.syncclinic.appointmentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

// Main entry point for Appointment Service
@SpringBootApplication
public class AppointmentserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppointmentserviceApplication.class, args);
    }

    @Bean
    public org.springframework.boot.CommandLineRunner seedAppointments(com.syncclinic.appointmentservice.repository.AppointmentRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                System.out.println("No appointments found! Seeding database...");

                com.syncclinic.appointmentservice.model.Appointment app1 = com.syncclinic.appointmentservice.model.Appointment.builder()
                        .patientId(1L) // Assuming your registered user ID is 1
                        .doctorId(1L)  // Linking to Dr. John Smith
                        .appointmentDate(java.time.LocalDate.now().plusDays(2)) // Scheduled for 2 days from now
                        .appointmentTime(java.time.LocalTime.of(10, 30))       // at 10:30 AM
                        .reason("Regular checkup for persistent migraines.")
                        // .status(com.syncclinic.appointmentservice.model.AppointmentStatus.SCHEDULED)
                        .build();

                com.syncclinic.appointmentservice.model.Appointment app2 = com.syncclinic.appointmentservice.model.Appointment.builder()
                        .patientId(1L)
                        .doctorId(2L)  // Linking to Dr. Emily Chen
                        .appointmentDate(java.time.LocalDate.now().plusDays(5))
                        .appointmentTime(java.time.LocalTime.of(14, 00))
                        .reason("Follow-up on pediatric vaccination schedule.")
                        // .status(com.syncclinic.appointmentservice.model.AppointmentStatus.PENDING)
                        .build();

                repository.save(app1);
                repository.save(app2);

                System.out.println("Appointment test data loaded successfully!");
            }
        };
    }
}