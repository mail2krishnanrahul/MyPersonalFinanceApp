package com.finance.app.repositories;

import com.finance.app.models.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for Account entity operations.
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    /**
     * Find all accounts belonging to a user.
     *
     * @param userId the user UUID
     * @return list of accounts
     */
    List<Account> findByUserId(UUID userId);
}
