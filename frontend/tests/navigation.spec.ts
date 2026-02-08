import { test, expect } from '@playwright/test';
import { loginTestUser } from './helpers/auth';

test.describe('Sidebar Navigation', () => {
    test('should navigate to Dashboard page', async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/dashboard');

        // Verify page heading
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

        // Verify sidebar is visible with navigation items
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Transactions' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Budgets' })).toBeVisible();
    });

    test('should navigate to Transactions page via sidebar', async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/dashboard');

        // Click on Transactions link in sidebar
        await page.getByRole('link', { name: 'Transactions' }).click();

        // Verify navigation
        await expect(page).toHaveURL('/transactions');
        await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();
    });

    test('should navigate to Budgets page via sidebar', async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/dashboard');

        // Click on Budgets link in sidebar
        await page.getByRole('link', { name: 'Budgets' }).click();

        // Verify navigation
        await expect(page).toHaveURL('/budgets');
        await expect(page.getByRole('heading', { name: 'Budgets' })).toBeVisible();
    });

    test('should redirect root to login when not authenticated', async ({ page }) => {
        await page.goto('/');

        // Should redirect to login
        await expect(page).toHaveURL(/.*login/);
    });
});

test.describe('Date Range Picker', () => {
    test('should display date range picker in header', async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/dashboard');

        // Date range picker button should be visible
        await expect(page.getByRole('button', { name: /Pick a date range|Feb|Jan|Mar/ })).toBeVisible();
    });

    test('should open calendar popover when clicked', async ({ page }) => {
        await loginTestUser(page);
        await page.goto('/dashboard');

        // Click on date range picker
        await page.getByRole('button', { name: /Pick a date range|Feb|Jan|Mar/ }).click();

        // Calendar should appear
        await expect(page.locator('[role="grid"]').first()).toBeVisible();
    });
});
