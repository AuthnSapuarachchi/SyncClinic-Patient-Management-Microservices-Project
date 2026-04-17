package com.SyncClinic.AIsymptomcheck.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SymptomCheckResponse {

    private List<String> possibleConditions;
    private List<String> recommendedSpecialties;
    private String urgencyLevel;
    private List<String> generalAdvice;
    private String disclaimer;
}