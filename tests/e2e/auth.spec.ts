import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Fundación Acavall/);
    await expect(page.getByRole('heading', { name: /Fundación Acavall/i })).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form
    await page.fill('input[type="email"]', 'admin@fundacionacavall.com');
    await page.fill('input[type="password"]', 'password');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@fundacionacavall.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@fundacionacavall.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Find and click logout button
    await page.click('[aria-label="User menu"]').catch(() => {});
    await page.click('text=Cerrar sesión').catch(() => {
      // Try alternative logout method
      page.click('button:has-text("Salir")');
    });

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
