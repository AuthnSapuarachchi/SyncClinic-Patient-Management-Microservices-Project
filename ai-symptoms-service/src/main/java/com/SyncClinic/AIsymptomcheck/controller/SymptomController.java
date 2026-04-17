package com.SyncClinic.AIsymptomcheck.controller;

import com.SyncClinic.AIsymptomcheck.dto.SymptomCheckRequest;
import com.SyncClinic.AIsymptomcheck.dto.SymptomCheckResponse;
import com.SyncClinic.AIsymptomcheck.dto.SymptomHistoryResponse;
import com.SyncClinic.AIsymptomcheck.service.SymptomService;
import com.SyncClinic.AIsymptomcheck.service.SymptomHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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
            @RequestHeader(value = "X-Patient-Id", required = false) String patientId) {

        SymptomCheckResponse response = symptomService.checkSymptoms(request);

        String resolvedPatientId = (patientId != null && !patientId.isBlank())
                ? patientId
                : "guest-" + UUID.randomUUID();

        historyService.saveHistory(resolvedPatientId, request, response);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SymptomHistoryResponse>> getMyHistory(
            @RequestHeader(value = "X-Patient-Id", required = false) String patientId) {

        if (patientId == null || patientId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(historyService.getPatientHistory(patientId));
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<SymptomHistoryResponse> getHistoryById(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Patient-Id", required = false) String patientId) {

        if (patientId == null || patientId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(historyService.getHistoryById(id, patientId));
    }

    @GetMapping("/history/all")
    public ResponseEntity<List<SymptomHistoryResponse>> getAllHistory() {
        return ResponseEntity.ok(historyService.getAllHistory());
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Map<String, String>> deleteHistoryById(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Patient-Id", required = false) String patientId) {

        if (patientId == null || patientId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        historyService.deleteHistoryById(id, patientId);
        return ResponseEntity.ok(Map.of("message", "History deleted successfully"));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> deleteAllMyHistory(
            @RequestHeader(value = "X-Patient-Id", required = false) String patientId) {

        if (patientId == null || patientId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        historyService.deleteAllPatientHistory(patientId);
        return ResponseEntity.ok(Map.of("message", "All history deleted successfully"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "symptom-checker-service",
                "status", "UP",
                "aiProvider", "OpenAI - gpt-4o-mini"
        ));
    }
}