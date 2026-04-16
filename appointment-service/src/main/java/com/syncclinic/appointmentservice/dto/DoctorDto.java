package com.syncclinic.appointmentservice.dto;

import lombok.*;

// DTO class to receive doctor details from Doctor Service
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDto {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String specialty;
    private String hospital;
    private String qualification;
    private Integer experienceYears;
    private String bio;
    private String status;
}