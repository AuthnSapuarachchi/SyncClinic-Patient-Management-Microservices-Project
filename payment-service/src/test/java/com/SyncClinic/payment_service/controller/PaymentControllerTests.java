package com.SyncClinic.payment_service.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.SyncClinic.payment_service.dto.request.CreatePaymentRequest;
import com.SyncClinic.payment_service.dto.response.PaymentResponse;
import com.SyncClinic.payment_service.entity.Payment;
import com.SyncClinic.payment_service.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentService paymentService;

    @AfterEach
    void clearSecurityContext() {
        // No security context required for payment-service endpoints after JWT removal
    }

    @Test
    void createPaymentIntentReturnsOk() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setAppointmentId("appt-123");

        PaymentResponse response = new PaymentResponse(
                "pay-1",
                "appt-123",
                "Dr. Smith",
                new BigDecimal("1500.00"),
                "lkr",
                Payment.PaymentStatus.PENDING,
                "pi_client_secret",
                "pk_test_123",
                LocalDateTime.now(),
                null
        );

        when(paymentService.createPaymentIntent(any(CreatePaymentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/payments/intent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointmentId").value("appt-123"))
                .andExpect(jsonPath("$.clientSecret").value("pi_client_secret"))
                .andExpect(jsonPath("$.publishableKey").value("pk_test_123"));
    }

    @Test
    void handleStripeWebhookReturnsReceivedTrue() throws Exception {
        mockMvc.perform(post("/api/payments/webhook")
                        .content("{\"id\":\"evt_test\"}")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", "test-signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.received").value(true));

        verify(paymentService).handleStripeWebhook(any(String.class), eq("test-signature"));
    }

    @Test
    void getPaymentByAppointmentReturnsPaymentInfo() throws Exception {
        PaymentResponse response = new PaymentResponse(
                "pay-2",
                "appt-456",
                "Dr. Ada",
                new BigDecimal("2000.00"),
                "lkr",
                Payment.PaymentStatus.PAID,
                null,
                null,
                LocalDateTime.now(),
                null
        );

        when(paymentService.getPaymentByAppointment("appt-456")).thenReturn(response);

        mockMvc.perform(get("/api/payments/appt-456"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointmentId").value("appt-456"))
                .andExpect(jsonPath("$.status").value("PAID"));
    }

    @Test
    void getMyPaymentsReturnsPatientList() throws Exception {
        PaymentResponse response = new PaymentResponse(
                "pay-3",
                "appt-789",
                "Dr. Grace",
                new BigDecimal("2500.00"),
                "lkr",
                Payment.PaymentStatus.PENDING,
                null,
                null,
                LocalDateTime.now(),
                null
        );

        when(paymentService.getMyPayments()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/payments/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].appointmentId").value("appt-789"))
                .andExpect(jsonPath("$[0].doctorName").value("Dr. Grace"));
    }

    @Test
    void getAllPaymentsReturnsTransactionPage() throws Exception {
        PaymentResponse response = new PaymentResponse(
                "pay-4",
                "appt-987",
                "Dr. John",
                new BigDecimal("3000.00"),
                "lkr",
                Payment.PaymentStatus.FAILED,
                null,
                null,
                LocalDateTime.now(),
                "Card declined"
        );

        when(paymentService.getAllPayments(0, 20)).thenReturn(List.of(response));
        when(paymentService.getTotalPaymentsCount()).thenReturn(1L);

        mockMvc.perform(get("/api/payments/admin/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactions[0].appointmentId").value("appt-987"))
                .andExpect(jsonPath("$.total").value(1));
    }
}
