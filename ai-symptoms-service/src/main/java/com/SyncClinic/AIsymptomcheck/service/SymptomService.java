package com.SyncClinic.AIsymptomcheck.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.SyncClinic.AIsymptomcheck.dto.SymptomCheckRequest;
import com.SyncClinic.AIsymptomcheck.dto.SymptomCheckResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SymptomService {

    private static final Logger log = LoggerFactory.getLogger(SymptomService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api-url}")
    private String apiUrl;

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    public SymptomService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public SymptomCheckResponse checkSymptoms(SymptomCheckRequest request) {
        String prompt = buildPrompt(request);
        String aiResponse = callOpenAi(prompt);
        return parseResponse(aiResponse);
    }

    private String buildPrompt(SymptomCheckRequest request) {

        String symptomsList = String.join(", ", request.getSymptoms());

        return """
                You are a medical AI assistant.

                IMPORTANT:
                Return ONLY valid JSON. No text. No markdown.

                Patient:
                - Age: %s
                - Gender: %s
                - Symptoms: %s
                - Additional: %s

                JSON FORMAT:
                {
                  "possibleConditions": [],
                  "recommendedSpecialties": [],
                  "urgencyLevel": "LOW",
                  "generalAdvice": []
                }
                """.formatted(
                request.getAge(),
                request.getGender(),
                symptomsList,
                request.getAdditionalInfo() != null ? request.getAdditionalInfo() : "None"
        );
    }

    private String callOpenAi(String prompt) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.3
        );

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    apiUrl,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());

            return root.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

        } catch (Exception e) {
            log.error("OpenAI call failed: {}", e.getMessage());
            throw new RuntimeException("AI service failed");
        }
    }

    private SymptomCheckResponse parseResponse(String raw) {

        try {
            String cleaned = raw.replace("```json", "").replace("```", "").trim();

            JsonNode node = objectMapper.readTree(cleaned);

            List<String> conditions = new ArrayList<>();
            List<String> specialties = new ArrayList<>();
            List<String> advice = new ArrayList<>();

            node.path("possibleConditions").forEach(n -> conditions.add(n.asText()));
            node.path("recommendedSpecialties").forEach(n -> specialties.add(n.asText()));
            node.path("generalAdvice").forEach(n -> advice.add(n.asText()));

            return SymptomCheckResponse.builder()
                    .possibleConditions(conditions)
                    .recommendedSpecialties(specialties)
                    .urgencyLevel(node.path("urgencyLevel").asText("MEDIUM"))
                    .generalAdvice(advice)
                    .disclaimer("AI-generated info, not medical advice.")
                    .build();

        } catch (Exception e) {
            log.error("Parse error: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI response");
        }
    }
}