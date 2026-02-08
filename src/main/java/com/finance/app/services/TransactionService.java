package com.finance.app.services;

import com.finance.app.dto.TransactionDTO;
import com.finance.app.models.Transaction;
import com.finance.app.repositories.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Service layer for Transaction business logic.
 */
@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /**
     * Get all transactions with pagination.
     *
     * @param pageable pagination parameters
     * @return page of transactions
     */
    @Transactional(readOnly = true)
    public Page<TransactionDTO> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable)
                .map(this::toDTO);
    }

    /**
     * Get transactions filtered by category with pagination.
     *
     * @param category the category to filter by
     * @param pageable pagination parameters
     * @return page of transactions
     */
    @Transactional(readOnly = true)
    public Page<TransactionDTO> getTransactionsByCategory(String category, Pageable pageable) {
        return transactionRepository.findByCategoryIgnoreCase(category, pageable)
                .map(this::toDTO);
    }

    /**
     * Convert Transaction entity to DTO.
     *
     * @param transaction the entity
     * @return the DTO
     */
    private TransactionDTO toDTO(Transaction transaction) {
        return TransactionDTO.builder()
                .id(transaction.getId())
                .rawDescription(transaction.getRawDescription())
                .cleanDescription(transaction.getCleanDescription())
                .category(transaction.getCategory())
                .amount(transaction.getAmount())
                .transactionDate(transaction.getTransactionDate())
                .status(transaction.getStatus() != null ? transaction.getStatus() : determineStatus(transaction))
                .build();
    }

    /**
     * Determine transaction status based on data completeness.
     * - Cleaned: has both clean description and category
     * - Flagged: high value transactions (>$1000) without categorization
     * - Raw: not yet processed
     *
     * @param transaction the transaction
     * @return status string
     */
    private String determineStatus(Transaction transaction) {
        boolean hasCleaned = transaction.getCleanDescription() != null
                && !transaction.getCleanDescription().isEmpty();
        boolean hasCategory = transaction.getCategory() != null
                && !transaction.getCategory().isEmpty();

        if (hasCleaned && hasCategory) {
            return "Cleaned";
        }

        // Flag high-value uncategorized transactions
        BigDecimal threshold = new BigDecimal("1000");
        if (transaction.getAmount() != null
                && transaction.getAmount().abs().compareTo(threshold) > 0
                && !hasCategory) {
            return "Flagged";
        }

        return "Raw";
    }
}
