package com.finance.app.services;

import com.finance.app.dto.BurnRateDTO;
import com.finance.app.repositories.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

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
     * Calculate burn rate (spending velocity) for months within the given date
     * range.
     * Shows up to 4 months of data ending at the endDate month.
     *
     * @param startDate the start of the date range (optional, defaults to 4 months
     *                  ago)
     * @param endDate   the end of the date range (optional, defaults to current
     *                  date)
     * @return List of BurnRateDTO with monthly spending data
     */
    @Transactional(readOnly = true)
    public List<BurnRateDTO> calculateBurnRate(LocalDate startDate, LocalDate endDate) {
        // Default to current date if not provided
        LocalDate effectiveEndDate = endDate != null ? endDate : LocalDate.now();
        YearMonth endMonth = YearMonth.from(effectiveEndDate);

        // Calculate start month (default to 3 months before end month = 4 months total)
        YearMonth startMonth;
        if (startDate != null) {
            startMonth = YearMonth.from(startDate);
        } else {
            startMonth = endMonth.minusMonths(3);
        }

        // Determine current month for highlighting
        YearMonth currentMonth = YearMonth.now();

        List<BurnRateDTO> results = new ArrayList<>();

        // Iterate through months from start to end
        YearMonth month = startMonth;
        while (!month.isAfter(endMonth)) {
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
                    .isCurrentMonth(month.equals(currentMonth))
                    .build());

            month = month.plusMonths(1);
        }

        return results;
    }

    /**
     * Calculate burn rate for the last 4 months (backward compatible).
     *
     * @return List of BurnRateDTO with monthly spending data
     */
    @Transactional(readOnly = true)
    public List<BurnRateDTO> calculateBurnRate() {
        return calculateBurnRate(null, null);
    }
}
