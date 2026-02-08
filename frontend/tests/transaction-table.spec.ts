import { test, expect } from '@playwright/test';
import { loginTestUser } from './helpers/auth';

test.describe('Transaction Table', () => {
    test.beforeEach(async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/transactions');
    });

    test('should display transaction table', async ({ page }) => {
        // Page heading
        await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();

        // Table should be visible
        await expect(page.locator('table')).toBeVisible();

        // Table headers should be present
        await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Description' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Category' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Amount' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    });

    test('should display category filter dropdown', async ({ page }) => {
        // Category filter dropdown should be visible
        const filterButton = page.getByRole('combobox').first();
        await expect(filterButton).toBeVisible();

        // Click to open dropdown
        await filterButton.click();

        // Options should appear
        await expect(page.getByRole('option', { name: 'All' })).toBeVisible();
        await expect(page.getByRole('option', { name: 'Dining' })).toBeVisible();
    });

    test('should display pagination controls', async ({ page }) => {
        // Pagination text
        await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible();

        // Rows per page selector
        await expect(page.getByText('Rows per page')).toBeVisible();

        // First/prev/next/last buttons should exist in pagination area
        await expect(page.locator('button').filter({ hasText: '' }).first()).toBeVisible();
    });

    test('should have status column for badges', async ({ page }) => {
        // Verify the Status column header is present (badges will appear when backend provides data)
        await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    });

    test('should filter by category', async ({ page }) => {
        // Open category filter
        const filterButton = page.getByRole('combobox').first();
        await filterButton.click();

        // Select Dining category
        await page.getByRole('option', { name: 'Dining' }).click();

        // Filter should be applied (button text changes)
        await expect(filterButton).toContainText('Dining');
    });

    test('should change page size', async ({ page }) => {
        // Find rows per page selector
        const pageSizeSelector = page.getByRole('combobox').nth(1);
        await pageSizeSelector.click();

        // Select 20 rows per page
        await page.getByRole('option', { name: '20' }).click();

        // Selector should show new value
        await expect(pageSizeSelector).toContainText('20');
    });
});

test.describe('Transaction Table - Category Icons', () => {
    test('should display category icons', async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/transactions');

        // Table cells in category column should have icons (svg elements)
        const categoryColumn = page.locator('table tbody tr td:nth-child(3)');
        const firstCategoryCell = categoryColumn.first();

        // Should contain an SVG icon
        await expect(firstCategoryCell.locator('svg')).toBeVisible();
    });
});
