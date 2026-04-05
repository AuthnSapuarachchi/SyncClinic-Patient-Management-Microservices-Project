package com.SyncClinic.patient_service.entity;

<<<<<<< HEAD
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patients")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String email; // This will link them to their Auth credentials later!
    private String phone;
    private String dateOfBirth;
    private String bloodGroup;
    private String medicalHistory;
=======
public class Patient {
>>>>>>> 5a20b6e (api gatway setup and set the security and service registry setup and register servicess in one phone book)
}
