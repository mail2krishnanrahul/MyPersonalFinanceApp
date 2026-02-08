--liquibase formatted sql

--changeset finance:002-add-transaction-status
-- Add status column to transactions table for workflow tracking (PENDING, REVIEWED, COMPLETED)
ALTER TABLE transactions ADD COLUMN status VARCHAR(20) DEFAULT 'PENDING';

CREATE INDEX idx_transactions_status ON transactions(status);

--rollback ALTER TABLE transactions DROP COLUMN status;
