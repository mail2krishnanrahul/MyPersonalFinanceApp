package com.finance.app.controllers;

import com.finance.app.dto.BurnRateDTO;
import com.finance.app.services.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
     * Get burn rate analytics for the last 4 months.
     * Shows spending velocity to help users understand their spending patterns.
     *
     * @return List of monthly burn rate data
     */
    @GetMapping("/burn-rate")
    @Operation(summary = "Get burn rate", description = "Returns monthly spending totals for the last 4 months")
    public ResponseEntity<List<BurnRateDTO>> getBurnRate() {
        List<BurnRateDTO> burnRate = analyticsService.calculateBurnRate();
        return ResponseEntity.ok(burnRate);
    }
}
