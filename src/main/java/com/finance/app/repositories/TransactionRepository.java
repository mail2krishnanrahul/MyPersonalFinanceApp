package com.finance.app.repositories;

import com.finance.app.models.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for Transaction entity operations.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    /**
     * Find all transactions for a specific account.
     *
     * @param accountId the account UUID
     * @return list of transactions
     */
    List<Transaction> findByAccountId(UUID accountId);

    /**
     * Find all transactions for a specific category.
     *
     * @param category the category name
     * @return list of transactions
     */
    List<Transaction> findByCategory(String category);

    /**
     * Find transactions by category with pagination (case-insensitive).
     *
     * @param category the category name
     * @param pageable pagination parameters
     * @return page of transactions
     */
    Page<Transaction> findByCategoryIgnoreCase(String category, Pageable pageable);

    /**
     * Find transactions within a date range.
     *
     * @param startDate start of the date range
     * @param endDate   end of the date range
     * @return list of transactions
     */
    List<Transaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find transactions for an account within a date range.
     *
     * @param accountId the account UUID
     * @param startDate start of the date range
     * @param endDate   end of the date range
     * @return list of transactions
     */
    List<Transaction> findByAccountIdAndTransactionDateBetween(
            UUID accountId, LocalDateTime startDate, LocalDateTime endDate);
}
