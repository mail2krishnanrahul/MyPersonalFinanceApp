package com.finance.app.controllers;

import com.finance.app.dto.BurnRateDTO;
import com.finance.app.services.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for financial analytics endpoints.
 */
@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Financial analytics and reporting endpoints")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Get burn rate analytics for the specified date range.
     * Shows spending velocity to help users understand their spending patterns.
     *
     * @param startDate optional start date (defaults to 4 months before end date)
     * @param endDate   optional end date (defaults to current date)
     * @return List of monthly burn rate data
     */
    @GetMapping("/burn-rate")
    @Operation(summary = "Get burn rate", description = "Returns monthly spending totals for the specified date range")
    public ResponseEntity<List<BurnRateDTO>> getBurnRate(
            @Parameter(description = "Start date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<BurnRateDTO> burnRate = analyticsService.calculateBurnRate(startDate, endDate);
        return ResponseEntity.ok(burnRate);
    }
}
