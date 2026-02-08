import { Page } from '@playwright/test';

/**
 * Helper function to register and login a user before tests
 * Creates a unique user each time to avoid conflicts
 */
export async function loginTestUser(page: Page) {
    await page.goto('/login');

    // Register a unique user each time
    await page.click('text=Sign up');
    const timestamp = Date.now();
    await page.fill('input[type="text"]', 'Test User');
    await page.fill('input[type="email"]', `testuser${timestamp}@example.com`);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
}
