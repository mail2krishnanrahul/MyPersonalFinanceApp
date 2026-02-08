import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should register, login, and logout successfully', async ({ page }) => {
        // Navigate to app - should redirect to login
        await page.goto('http://localhost:3000');
        await expect(page).toHaveURL(/.*login/);

        console.log('✓ Redirected to login page (protected route works)');

        // Go to register page
        await page.click('text=Sign up');
        await expect(page).toHaveURL(/.*register/);

        console.log('✓ Navigated to register page');

        // Fill registration form
        const timestamp = Date.now();
        await page.fill('input[type="text"]', 'Test User');
        await page.fill('input[type="email"]', `testuser${timestamp}@example.com`);
        await page.fill('input[type="password"]', 'password123');

        // Submit registration
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

        console.log('✓ Registration successful, redirected to dashboard');

        // Check sidebar shows user email
        await expect(page.locator(`text=${`testuser${timestamp}@example.com`}`)).toBeVisible();

        console.log('✓ User email displayed in sidebar');

        // Check logout button exists
        await expect(page.locator('button:has-text("Logout")')).toBeVisible();

        console.log('✓ Logout button visible');

        // Click logout
        await page.click('button:has-text("Logout")');

        // Should redirect back to login
        await expect(page).toHaveURL(/.*login/, { timeout: 5000 });

        console.log('✓ Logout successful, redirected to login');

        // Try to access dashboard without auth
        await page.goto('http://localhost:3000/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/.*login/, { timeout: 5000 });

        console.log('✓ Protected route redirects unauthenticated user');

        console.log('\n🎉 All authentication tests passed!');
    });
});
