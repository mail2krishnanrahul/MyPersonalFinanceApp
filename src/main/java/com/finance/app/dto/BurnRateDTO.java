package com.finance.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for monthly burn rate analytics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BurnRateDTO {

    private String monthName;
    private BigDecimal totalSpent;
    private boolean isCurrentMonth;
}
