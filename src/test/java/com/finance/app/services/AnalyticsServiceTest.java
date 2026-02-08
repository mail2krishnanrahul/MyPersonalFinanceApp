package com.finance.app.services;

import com.finance.app.dto.BurnRateDTO;
import com.finance.app.models.Transaction;
import com.finance.app.repositories.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for AnalyticsService.
 */
@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private Transaction createTransaction(BigDecimal amount, LocalDateTime date) {
        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setTransactionDate(date);
        return transaction;
    }

    @Test
    @DisplayName("calculateBurnRate returns last 4 months when no date range provided")
    void shouldReturnLast4MonthsWhenNoDateRange() {
        // Given - mock empty results for simplicity
        when(transactionRepository.findByTransactionDateBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        // When
        List<BurnRateDTO> result = analyticsService.calculateBurnRate();

        // Then
        assertThat(result).hasSize(4);
        assertThat(result.get(3).isCurrentMonth()).isTrue(); // Last one should be current month
    }

    @Test
    @DisplayName("calculateBurnRate respects provided date range")
    void shouldRespectProvidedDateRange() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 6, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 31);

        when(transactionRepository.findByTransactionDateBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        // When
        List<BurnRateDTO> result = analyticsService.calculateBurnRate(startDate, endDate);

        // Then - should return June, July, August (3 months)
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getMonthName()).contains("Jun");
        assertThat(result.get(1).getMonthName()).contains("Jul");
        assertThat(result.get(2).getMonthName()).contains("Aug");
    }

    @Test
    @DisplayName("calculateBurnRate correctly sums expenses (negative amounts)")
    void shouldSumOnlyExpenses() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        List<Transaction> januaryTransactions = Arrays.asList(
                createTransaction(new BigDecimal("-100.00"), LocalDateTime.of(2025, 1, 5, 10, 0)),
                createTransaction(new BigDecimal("-50.00"), LocalDateTime.of(2025, 1, 10, 10, 0)),
                createTransaction(new BigDecimal("200.00"), LocalDateTime.of(2025, 1, 15, 10, 0)) // Income - should be
                                                                                                  // excluded
        );

        when(transactionRepository.findByTransactionDateBetween(any(), any()))
                .thenReturn(januaryTransactions);

        // When
        List<BurnRateDTO> result = analyticsService.calculateBurnRate(startDate, endDate);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTotalSpent()).isEqualByComparingTo(new BigDecimal("150.00")); // Only expenses
                                                                                                  // summed
    }

    @Test
    @DisplayName("calculateBurnRate marks current month correctly")
    void shouldMarkCurrentMonthCorrectly() {
        // Given - use current month in range
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusMonths(1).withDayOfMonth(1);
        LocalDate endDate = today;

        when(transactionRepository.findByTransactionDateBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        // When
        List<BurnRateDTO> result = analyticsService.calculateBurnRate(startDate, endDate);

        // Then - last month should be current
        assertThat(result).isNotEmpty();
        BurnRateDTO lastMonth = result.get(result.size() - 1);
        assertThat(lastMonth.isCurrentMonth()).isTrue();
    }

    @Test
    @DisplayName("calculateBurnRate handles empty transactions")
    void shouldHandleEmptyTransactions() {
        // Given
        when(transactionRepository.findByTransactionDateBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        // When
        List<BurnRateDTO> result = analyticsService.calculateBurnRate();

        // Then
        assertThat(result).hasSize(4);
        result.forEach(dto -> {
            assertThat(dto.getTotalSpent()).isEqualByComparingTo(BigDecimal.ZERO);
        });
    }

    @Test
    @DisplayName("calculateBurnRate handles null amounts gracefully")
    void shouldHandleNullAmounts() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        Transaction txWithNull = new Transaction();
        txWithNull.setAmount(null);
        txWithNull.setTransactionDate(LocalDateTime.of(2025, 1, 5, 10, 0));

        Transaction validTx = createTransaction(new BigDecimal("-75.00"), LocalDateTime.of(2025, 1, 10, 10, 0));

        when(transactionRepository.findByTransactionDateBetween(any(), any()))
                .thenReturn(Arrays.asList(txWithNull, validTx));

        // When
        List<BurnRateDTO> result = analyticsService.calculateBurnRate(startDate, endDate);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTotalSpent()).isEqualByComparingTo(new BigDecimal("75.00"));
    }

    @Test
    @DisplayName("calculateBurnRate with single month range")
    void shouldHandleSingleMonthRange() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 5, 1);
        LocalDate endDate = LocalDate.of(2025, 5, 31);

        when(transactionRepository.findByTransactionDateBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        // When
        List<BurnRateDTO> result = analyticsService.calculateBurnRate(startDate, endDate);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMonthName()).contains("May");
    }
}
