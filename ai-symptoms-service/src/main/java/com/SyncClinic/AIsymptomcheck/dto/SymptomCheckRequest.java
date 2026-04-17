package com.SyncClinic.AIsymptomcheck.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class SymptomCheckRequest {

    @NotBlank
    private String age;

    @NotBlank
    private String gender;

    @Size(min = 1)
    private List<String> symptoms;

    private String additionalInfo;
}