package com.finance.app.controllers;

import com.finance.app.dto.BurnRateDTO;
import com.finance.app.services.AnalyticsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AnalyticsController.
 */
@WebMvcTest(AnalyticsController.class)
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    private List<BurnRateDTO> createSampleBurnRateData() {
        return Arrays.asList(
                BurnRateDTO.builder()
                        .monthName("Nov 2025")
                        .totalSpent(new BigDecimal("5000.00"))
                        .isCurrentMonth(false)
                        .build(),
                BurnRateDTO.builder()
                        .monthName("Dec 2025")
                        .totalSpent(new BigDecimal("6500.00"))
                        .isCurrentMonth(false)
                        .build(),
                BurnRateDTO.builder()
                        .monthName("Jan 2026")
                        .totalSpent(new BigDecimal("4200.00"))
                        .isCurrentMonth(false)
                        .build(),
                BurnRateDTO.builder()
                        .monthName("Feb 2026")
                        .totalSpent(new BigDecimal("1500.00"))
                        .isCurrentMonth(true)
                        .build());
    }

    @Test
    @DisplayName("GET /api/analytics/burn-rate returns burn rate data without date params")
    void shouldReturnBurnRateWithoutDateParams() throws Exception {
        // Given
        when(analyticsService.calculateBurnRate(any(), any()))
                .thenReturn(createSampleBurnRateData());

        // When & Then
        mockMvc.perform(get("/api/analytics/burn-rate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].monthName", is("Nov 2025")))
                .andExpect(jsonPath("$[0].totalSpent", is(5000.00)))
                .andExpect(jsonPath("$[0].currentMonth", is(false)))
                .andExpect(jsonPath("$[3].monthName", is("Feb 2026")))
                .andExpect(jsonPath("$[3].currentMonth", is(true)));

        verify(analyticsService).calculateBurnRate(null, null);
    }

    @Test
    @DisplayName("GET /api/analytics/burn-rate accepts date range parameters")
    void shouldAcceptDateRangeParams() throws Exception {
        // Given
        List<BurnRateDTO> augustSeptData = Arrays.asList(
                BurnRateDTO.builder()
                        .monthName("Aug 2025")
                        .totalSpent(new BigDecimal("3500.00"))
                        .isCurrentMonth(false)
                        .build(),
                BurnRateDTO.builder()
                        .monthName("Sept 2025")
                        .totalSpent(new BigDecimal("4800.00"))
                        .isCurrentMonth(false)
                        .build());

        when(analyticsService.calculateBurnRate(
                eq(LocalDate.of(2025, 8, 1)),
                eq(LocalDate.of(2025, 9, 30))))
                .thenReturn(augustSeptData);

        // When & Then
        mockMvc.perform(get("/api/analytics/burn-rate")
                .param("startDate", "2025-08-01")
                .param("endDate", "2025-09-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].monthName", is("Aug 2025")))
                .andExpect(jsonPath("$[1].monthName", is("Sept 2025")));

        verify(analyticsService).calculateBurnRate(
                LocalDate.of(2025, 8, 1),
                LocalDate.of(2025, 9, 30));
    }

    @Test
    @DisplayName("GET /api/analytics/burn-rate returns empty list when no data")
    void shouldReturnEmptyListWhenNoData() throws Exception {
        // Given
        when(analyticsService.calculateBurnRate(any(), any()))
                .thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/analytics/burn-rate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/analytics/burn-rate handles invalid date format gracefully")
    void shouldReturn400ForInvalidDateFormat() throws Exception {
        // When & Then - invalid date format should cause 400 Bad Request
        mockMvc.perform(get("/api/analytics/burn-rate")
                .param("startDate", "invalid-date"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/analytics/burn-rate with only startDate param")
    void shouldAcceptOnlyStartDateParam() throws Exception {
        // Given
        when(analyticsService.calculateBurnRate(any(), any()))
                .thenReturn(createSampleBurnRateData());

        // When & Then
        mockMvc.perform(get("/api/analytics/burn-rate")
                .param("startDate", "2025-10-01"))
                .andExpect(status().isOk());

        verify(analyticsService).calculateBurnRate(
                eq(LocalDate.of(2025, 10, 1)),
                isNull());
    }

    @Test
    @DisplayName("GET /api/analytics/burn-rate with only endDate param")
    void shouldAcceptOnlyEndDateParam() throws Exception {
        // Given
        when(analyticsService.calculateBurnRate(any(), any()))
                .thenReturn(createSampleBurnRateData());

        // When & Then
        mockMvc.perform(get("/api/analytics/burn-rate")
                .param("endDate", "2025-12-31"))
                .andExpect(status().isOk());

        verify(analyticsService).calculateBurnRate(
                isNull(),
                eq(LocalDate.of(2025, 12, 31)));
    }
}
