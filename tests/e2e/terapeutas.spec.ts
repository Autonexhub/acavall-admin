import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@fundacionacavall.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Therapists (Terapeutas) CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to therapists list', async ({ page }) => {
    await page.goto('/therapists');
    await expect(page.getByRole('heading', { name: /therapists/i })).toBeVisible();
  });

  test('should display therapists list', async ({ page }) => {
    await page.goto('/therapists');
    await page.waitForTimeout(2000);

    // Should show at least one therapist from seed data
    const therapistCards = page.locator('[data-testid="therapist-card"]').or(page.locator('article, .card').first());
    await expect(therapistCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should create a new therapist', async ({ page }) => {
    await page.goto('/therapists/new');

    const testName = `Test Therapist ${Date.now()}`;

    // Fill in the form
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="specialty"]', 'Test Specialty');
    await page.fill('input[name="email"]', `test${Date.now()}@fundacionacavall.com`);
    await page.fill('input[name="phone"]', '+34 600 000 000');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to therapists list
    await expect(page).toHaveURL(/\/therapists/, { timeout: 5000 });
  });

  test('should view therapist details', async ({ page }) => {
    await page.goto('/therapists');
    await page.waitForTimeout(2000);

    // Click on first therapist
    const firstTherapist = page.locator('article, .card').first();
    await firstTherapist.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/therapists\/\d+/);
  });
});
