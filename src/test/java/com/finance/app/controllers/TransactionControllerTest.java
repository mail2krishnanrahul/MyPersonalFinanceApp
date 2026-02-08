package com.finance.app.controllers;

import com.finance.app.dto.TransactionDTO;
import com.finance.app.services.TransactionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for TransactionController.
 * Tests REST API endpoints with MockMvc.
 */
@WebMvcTest(TransactionController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @MockBean
    private com.finance.app.security.JwtService jwtService;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    private TransactionDTO createSampleDTO() {
        return TransactionDTO.builder()
                .id(UUID.randomUUID())
                .rawDescription("TEST TRANSACTION")
                .cleanDescription("Test Transaction")
                .category("Dining")
                .amount(new BigDecimal("50.00"))
                .transactionDate(LocalDateTime.now())
                .status("Cleaned")
                .build();
    }

    @Nested
    @DisplayName("GET /api/transactions")
    class GetTransactionsTests {

        @Test
        @DisplayName("should return paginated transactions")
        void shouldReturnPaginatedTransactions() throws Exception {
            // Arrange
            TransactionDTO dto = createSampleDTO();
            Page<TransactionDTO> page = new PageImpl<>(
                    List.of(dto),
                    PageRequest.of(0, 10),
                    1);
            when(transactionService.getAllTransactions(any())).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get("/api/transactions")
                    .param("page", "0")
                    .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].rawDescription").value("TEST TRANSACTION"))
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @DisplayName("should use default pagination values")
        void shouldUseDefaultPaginationValues() throws Exception {
            // Arrange
            Page<TransactionDTO> page = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);
            when(transactionService.getAllTransactions(any())).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get("/api/transactions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should filter by category when provided")
        void shouldFilterByCategory() throws Exception {
            // Arrange
            TransactionDTO dto = createSampleDTO();
            Page<TransactionDTO> page = new PageImpl<>(List.of(dto), PageRequest.of(0, 10), 1);
            when(transactionService.getTransactionsByCategory(eq("Dining"), any())).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get("/api/transactions")
                    .param("category", "Dining"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].category").value("Dining"));
        }

        @Test
        @DisplayName("should ignore 'All' category filter")
        void shouldIgnoreAllCategoryFilter() throws Exception {
            // Arrange
            Page<TransactionDTO> page = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);
            when(transactionService.getAllTransactions(any())).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get("/api/transactions")
                    .param("category", "All"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should return correct page metadata")
        void shouldReturnCorrectPageMetadata() throws Exception {
            // Arrange
            TransactionDTO dto = createSampleDTO();
            Page<TransactionDTO> page = new PageImpl<>(
                    List.of(dto),
                    PageRequest.of(1, 10),
                    25);
            when(transactionService.getAllTransactions(any())).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get("/api/transactions")
                    .param("page", "1")
                    .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.number").value(1))
                    .andExpect(jsonPath("$.size").value(10))
                    .andExpect(jsonPath("$.totalElements").value(25))
                    .andExpect(jsonPath("$.totalPages").value(3));
        }
    }

    @Nested
    @DisplayName("Response Format")
    class ResponseFormatTests {

        @Test
        @DisplayName("should return transaction with all fields")
        void shouldReturnTransactionWithAllFields() throws Exception {
            // Arrange
            TransactionDTO dto = createSampleDTO();
            Page<TransactionDTO> page = new PageImpl<>(List.of(dto), PageRequest.of(0, 10), 1);
            when(transactionService.getAllTransactions(any())).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get("/api/transactions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].id").exists())
                    .andExpect(jsonPath("$.content[0].rawDescription").exists())
                    .andExpect(jsonPath("$.content[0].cleanDescription").exists())
                    .andExpect(jsonPath("$.content[0].category").exists())
                    .andExpect(jsonPath("$.content[0].amount").exists())
                    .andExpect(jsonPath("$.content[0].transactionDate").exists())
                    .andExpect(jsonPath("$.content[0].status").exists());
        }
    }
}
