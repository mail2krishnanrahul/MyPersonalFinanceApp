package com.finance.app.services;

import com.finance.app.dto.BurnRateDTO;
import com.finance.app.repositories.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for analytics and reporting on financial data.
 */
@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");

    public AnalyticsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /**
     * Calculate burn rate (spending velocity) for the last 4 months.
     * Aggregates transaction totals by month and identifies current month.
     *
     * @return List of BurnRateDTO with monthly spending data
     */
    @Transactional(readOnly = true)
    public List<BurnRateDTO> calculateBurnRate() {
        YearMonth currentMonth = YearMonth.now();
        List<BurnRateDTO> results = new ArrayList<>();

        // Get data for last 4 months (including current)
        for (int i = 3; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            LocalDateTime startOfMonth = month.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = month.atEndOfMonth().atTime(23, 59, 59);

            // Sum all negative amounts (expenses) for this month
            BigDecimal totalSpent = transactionRepository
                    .findByTransactionDateBetween(startOfMonth, endOfMonth)
                    .stream()
                    .filter(t -> t.getAmount() != null && t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                    .map(t -> t.getAmount().abs())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            results.add(BurnRateDTO.builder()
                    .monthName(month.format(MONTH_FORMATTER))
                    .totalSpent(totalSpent)
                    .isCurrentMonth(i == 0)
                    .build());
        }

        return results;
    }
}
