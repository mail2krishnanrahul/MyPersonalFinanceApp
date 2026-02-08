package com.finance.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object for Transaction data sent to frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {

    private UUID id;
    private String rawDescription;
    private String cleanDescription;
    private String category;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private String status;
}
