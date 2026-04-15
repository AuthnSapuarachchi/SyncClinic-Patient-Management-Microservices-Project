package com.syncclinic.appointmentservice.dto;

import lombok.*;

// DTO class to receive doctor availability details
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAvailabilityDto {

    private Long id;
    private Long doctorId;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
}