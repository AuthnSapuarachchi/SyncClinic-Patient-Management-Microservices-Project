package com.SyncClinic.AIsymptomcheck.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.SyncClinic.AIsymptomcheck.dto.SymptomCheckRequest;
import com.SyncClinic.AIsymptomcheck.dto.SymptomCheckResponse;
import com.SyncClinic.AIsymptomcheck.dto.SymptomHistoryResponse;
import com.SyncClinic.AIsymptomcheck.service.SymptomHistoryService;
import com.SyncClinic.AIsymptomcheck.service.SymptomService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/symptoms")
public class SymptomController {

    private final SymptomService symptomService;
    private final SymptomHistoryService historyService;

    public SymptomController(SymptomService symptomService,
                             SymptomHistoryService historyService) {
        this.symptomService = symptomService;
        this.historyService = historyService;
    }

    @PostMapping("/check")
    public ResponseEntity<SymptomCheckResponse> checkSymptoms(
            @Valid @RequestBody SymptomCheckRequest request,
            @RequestHeader(value = "X-Patient-Id", required = false) String patientIdHeader) {

        String patientId = resolvePatientId(patientIdHeader);
        SymptomCheckResponse response = symptomService.checkSymptoms(request);

        historyService.saveHistory(patientId, request, response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SymptomHistoryResponse>> getMyHistory(
            @RequestHeader(value = "X-Patient-Id", required = false) String patientIdHeader) {

        String patientId = requirePatientId(patientIdHeader);
        return ResponseEntity.ok(historyService.getPatientHistory(patientId));
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<SymptomHistoryResponse> getHistoryById(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Patient-Id", required = false) String patientIdHeader) {

        String patientId = requirePatientId(patientIdHeader);
        return ResponseEntity.ok(historyService.getHistoryById(id, patientId));
    }

    @GetMapping("/history/all")
    public ResponseEntity<List<SymptomHistoryResponse>> getAllHistory() {
        return ResponseEntity.ok(historyService.getAllHistory());
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Map<String, String>> deleteHistoryById(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Patient-Id", required = false) String patientIdHeader) {

        String patientId = requirePatientId(patientIdHeader);
        historyService.deleteHistoryById(id, patientId);
        return ResponseEntity.ok(Map.of("message", "History record deleted successfully"));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> deleteAllMyHistory(
            @RequestHeader(value = "X-Patient-Id", required = false) String patientIdHeader) {

        String patientId = requirePatientId(patientIdHeader);
        historyService.deleteAllPatientHistory(patientId);
        return ResponseEntity.ok(Map.of("message", "All history deleted successfully"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "symptom-checker-service",
                "status", "UP",
                "aiProvider", "OpenAI ChatGPT"
        ));
    }

    private String resolvePatientId(String patientIdHeader) {
        if (patientIdHeader == null || patientIdHeader.isBlank()) {
            return "anonymous";
        }
        return patientIdHeader.trim();
    }

    private String requirePatientId(String patientIdHeader) {
        if (patientIdHeader == null || patientIdHeader.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "X-Patient-Id header is required for history operations"
            );
        }
        return patientIdHeader.trim();
    }
}