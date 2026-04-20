package com.SyncClinic.AIsymptomcheck.service;

import com.SyncClinic.AIsymptomcheck.dto.SymptomCheckRequest;
import com.SyncClinic.AIsymptomcheck.dto.SymptomCheckResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
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

    @Value("${openai.model:gpt-4o-mini}") // Defaulting to the fast/cheap model
    private String model;

    public SymptomService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public SymptomCheckResponse checkSymptoms(SymptomCheckRequest request) {
        String prompt = buildPrompt(request);
        String rawResponse = callOpenAiApi(prompt);
        return parseResponse(rawResponse);
    }

    private String buildPrompt(SymptomCheckRequest request) {
        String symptomsList = String.join(", ", request.getSymptoms());
        String additional = (request.getAdditionalInfo() == null || request.getAdditionalInfo().isBlank())
                ? "None"
                : request.getAdditionalInfo();

        return """
                You are a medical triage assistant.
                Return ONLY valid JSON. No markdown. No extra text.

                Patient details:
                - Age: %s
                - Gender: %s
                - Symptoms: %s
                - Additional info: %s

                Required JSON schema:
                {
                  "possibleConditions": ["condition1", "condition2", "condition3"],
                  "recommendedSpecialties": ["specialty1", "specialty2"],
                  "urgencyLevel": "LOW" or "MEDIUM" or "HIGH",
                  "generalAdvice": ["advice1", "advice2", "advice3"]
                }

                Rules:
                - possibleConditions: 2 to 4 likely conditions
                - recommendedSpecialties: 1 to 3 specialties
                - urgencyLevel: LOW, MEDIUM, or HIGH only
                - generalAdvice: 3 to 4 practical tips
                - Never diagnose with certainty
                """.formatted(request.getAge(), request.getGender(), symptomsList, additional);
    }

    private String callOpenAiApi(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("OPENAI_API_KEY is missing from environment variables");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> systemMessage = Map.of(
                "role", "system",
                "content", "You are a safe medical triage assistant. Return strict JSON only."
        );

        Map<String, Object> userMessage = Map.of(
                "role", "user",
                "content", prompt
        );

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(systemMessage, userMessage),
                "temperature", 0.2
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("OpenAI returned empty/non-success response");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode contentNode = root.path("choices").get(0).path("message").path("content");

            if (contentNode.isMissingNode() || contentNode.asText().isBlank()) {
                throw new RuntimeException("OpenAI response content is empty");
            }

            return contentNode.asText();

        } catch (HttpStatusCodeException ex) {
            log.error("OpenAI API HTTP error: status={}, body={}", ex.getStatusCode(), ex.getResponseBodyAsString());
            if (ex.getStatusCode().value() == 401) throw new RuntimeException("Invalid OpenAI API key");
            if (ex.getStatusCode().value() == 429) throw new RuntimeException("OpenAI rate limit or billing exceeded");
            throw new RuntimeException("OpenAI API request failed");
        } catch (Exception ex) {
            log.error("OpenAI API call failed: {}", ex.getMessage(), ex);
            throw new RuntimeException("Failed to get response from AI service");
        }
    }

    private SymptomCheckResponse parseResponse(String rawResponse) {
        try {
            String cleaned = rawResponse.replace("```json", "").replace("```", "").trim();
            JsonNode node = objectMapper.readTree(cleaned);

            List<String> conditions = new ArrayList<>();
            List<String> specialties = new ArrayList<>();
            List<String> advice = new ArrayList<>();

            node.path("possibleConditions").forEach(n -> conditions.add(n.asText()));
            node.path("recommendedSpecialties").forEach(n -> specialties.add(n.asText()));
            node.path("generalAdvice").forEach(n -> advice.add(n.asText()));

            String urgency = node.path("urgencyLevel").asText("MEDIUM").toUpperCase();
            if (!urgency.equals("LOW") && !urgency.equals("MEDIUM") && !urgency.equals("HIGH")) {
                urgency = "MEDIUM";
            }

            return SymptomCheckResponse.builder()
                    .possibleConditions(conditions)
                    .recommendedSpecialties(specialties)
                    .urgencyLevel(urgency)
                    .generalAdvice(advice)
                    .disclaimer("This is an AI-generated preliminary assessment and not medical advice. Please consult a qualified healthcare professional.")
                    .build();

        } catch (Exception ex) {
            log.error("Failed to parse AI response: {}", ex.getMessage(), ex);
            throw new RuntimeException("Failed to parse AI response into JSON");
        }
    }
}