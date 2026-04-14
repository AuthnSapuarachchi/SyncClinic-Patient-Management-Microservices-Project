package com.SyncClinic.patient_service.controller;

import com.SyncClinic.patient_service.exception.GlobalExceptionHandler;
import com.SyncClinic.patient_service.service.PatientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PatientController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class PatientControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PatientService patientService;

    @Test
    void updateProfile_ShouldReturn400_WhenRequestBodyIsInvalid() throws Exception {
        String invalidPayload = """
                {
                  \"firstName\": \"\",
                  \"lastName\": \"\",
                  \"phone\": \"123\",
                  \"dateOfBirth\": \"2999-01-01\",
                  \"bloodGroup\": \"\"
                }
                """;

        mockMvc.perform(put("/api/patients/update/test@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.firstName").exists())
                .andExpect(jsonPath("$.validationErrors.lastName").exists())
                .andExpect(jsonPath("$.validationErrors.phone").exists())
                .andExpect(jsonPath("$.validationErrors.dateOfBirth").exists())
                .andExpect(jsonPath("$.validationErrors.bloodGroup").exists());
    }
}
