package com.finance.app.controllers;

import com.finance.app.dto.TransactionDTO;
import com.finance.app.services.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Transaction API endpoints.
 * Handles paginated GET requests with optional category filtering.
 */
@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Get paginated transactions with optional category filter.
     * 
     * Example: GET /api/transactions?page=0&size=10&category=Dining
     *
     * @param page     page number (0-indexed), default 0
     * @param size     page size, default 10
     * @param category optional category filter
     * @param sort     optional sort field, default transactionDate
     * @param dir      sort direction (asc/desc), default desc
     * @return paginated list of transactions
     */
    @GetMapping
    public ResponseEntity<Page<TransactionDTO>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "transactionDate") String sort,
            @RequestParam(defaultValue = "desc") String dir) {

        logger.info("Fetching transactions: page={}, size={}, category={}", page, size, category);

        // Build sort direction
        Sort.Direction direction = dir.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        // Build pageable with sorting
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort));

        Page<TransactionDTO> transactions;

        if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("All")) {
            transactions = transactionService.getTransactionsByCategory(category, pageable);
        } else {
            transactions = transactionService.getAllTransactions(pageable);
        }

        logger.info("Returning {} transactions out of {} total",
                transactions.getNumberOfElements(),
                transactions.getTotalElements());

        return ResponseEntity.ok(transactions);
    }
}
