package com.finance.app.services;

import com.finance.app.dto.TransactionDTO;
import com.finance.app.models.Account;
import com.finance.app.models.Transaction;
import com.finance.app.repositories.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Unit tests for TransactionService.
 * Tests pagination logic and status determination.
 */
@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction sampleTransaction;
    private Account sampleAccount;

    @BeforeEach
    void setUp() {
        sampleAccount = new Account();
        sampleAccount.setId(UUID.randomUUID());
        sampleAccount.setAccountName("Test Account");

        sampleTransaction = new Transaction();
        sampleTransaction.setId(UUID.randomUUID());
        sampleTransaction.setAccount(sampleAccount);
        sampleTransaction.setRawDescription("TEST TRANSACTION 123");
        sampleTransaction.setAmount(new BigDecimal("50.00"));
        sampleTransaction.setTransactionDate(LocalDateTime.now());
    }

    @Nested
    @DisplayName("getAllTransactions")
    class GetAllTransactionsTests {

        @Test
        @DisplayName("should return paginated transactions")
        void shouldReturnPaginatedTransactions() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Transaction> transactionPage = new PageImpl<>(
                    List.of(sampleTransaction),
                    pageable,
                    1);
            when(transactionRepository.findAll(any(Pageable.class))).thenReturn(transactionPage);

            // Act
            Page<TransactionDTO> result = transactionService.getAllTransactions(pageable);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("should map transaction to DTO correctly")
        void shouldMapTransactionToDTOCorrectly() {
            // Arrange
            sampleTransaction.setCleanDescription("Cleaned Description");
            sampleTransaction.setCategory("Dining");

            Pageable pageable = PageRequest.of(0, 10);
            Page<Transaction> transactionPage = new PageImpl<>(List.of(sampleTransaction), pageable, 1);
            when(transactionRepository.findAll(any(Pageable.class))).thenReturn(transactionPage);

            // Act
            Page<TransactionDTO> result = transactionService.getAllTransactions(pageable);

            // Assert
            TransactionDTO dto = result.getContent().get(0);
            assertThat(dto.getId()).isEqualTo(sampleTransaction.getId());
            assertThat(dto.getRawDescription()).isEqualTo("TEST TRANSACTION 123");
            assertThat(dto.getCleanDescription()).isEqualTo("Cleaned Description");
            assertThat(dto.getCategory()).isEqualTo("Dining");
        }
    }

    @Nested
    @DisplayName("getTransactionsByCategory")
    class GetTransactionsByCategoryTests {

        @Test
        @DisplayName("should filter by category")
        void shouldFilterByCategory() {
            // Arrange
            String category = "Dining";
            sampleTransaction.setCategory(category);
            sampleTransaction.setCleanDescription("Cleaned Description"); // For status check
            Pageable pageable = PageRequest.of(0, 10);
            Page<Transaction> transactionPage = new PageImpl<>(List.of(sampleTransaction), pageable, 1);
            when(transactionRepository.findByCategoryIgnoreCase(eq(category), any(Pageable.class)))
                    .thenReturn(transactionPage);

            // When
            Page<TransactionDTO> result = transactionService.getTransactionsByCategory(category, pageable);

            // Then
            // Then
            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getStatus()).isEqualTo("Cleaned");
            org.mockito.Mockito.verify(transactionRepository).findByCategoryIgnoreCase(category, pageable);
        }
    }

    @Nested
    @DisplayName("Status Determination")
    class StatusDeterminationTests {

        @Test
        @DisplayName("should return 'Cleaned' when transaction has clean description and category")
        void shouldReturnCleanedStatus() {
            // Arrange
            sampleTransaction.setCleanDescription("Cleaned Description");
            sampleTransaction.setCategory("Dining");

            Pageable pageable = PageRequest.of(0, 10);
            Page<Transaction> transactionPage = new PageImpl<>(List.of(sampleTransaction), pageable, 1);
            when(transactionRepository.findAll(any(Pageable.class))).thenReturn(transactionPage);

            // Act
            Page<TransactionDTO> result = transactionService.getAllTransactions(pageable);

            // Assert
            assertThat(result.getContent().get(0).getStatus()).isEqualTo("Cleaned");
        }

        @Test
        @DisplayName("should return 'Raw' when transaction has no clean description")
        void shouldReturnRawStatus() {
            // Arrange - no clean description set
            sampleTransaction.setCleanDescription(null);
            sampleTransaction.setCategory(null);

            Pageable pageable = PageRequest.of(0, 10);
            Page<Transaction> transactionPage = new PageImpl<>(List.of(sampleTransaction), pageable, 1);
            when(transactionRepository.findAll(any(Pageable.class))).thenReturn(transactionPage);

            // Act
            Page<TransactionDTO> result = transactionService.getAllTransactions(pageable);

            // Assert
            assertThat(result.getContent().get(0).getStatus()).isEqualTo("Raw");
        }

        @Test
        @DisplayName("should return 'Flagged' for high-value uncategorized transactions")
        void shouldReturnFlaggedStatus() {
            // Arrange - high value, no category
            sampleTransaction.setAmount(new BigDecimal("1500.00"));
            sampleTransaction.setCleanDescription(null);
            sampleTransaction.setCategory(null);

            Pageable pageable = PageRequest.of(0, 10);
            Page<Transaction> transactionPage = new PageImpl<>(List.of(sampleTransaction), pageable, 1);
            when(transactionRepository.findAll(any(Pageable.class))).thenReturn(transactionPage);

            // Act
            Page<TransactionDTO> result = transactionService.getAllTransactions(pageable);

            // Assert
            assertThat(result.getContent().get(0).getStatus()).isEqualTo("Flagged");
        }
    }
}
