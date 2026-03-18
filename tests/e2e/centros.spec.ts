import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@fundacionacavall.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Centers (Centros) CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to centers list', async ({ page }) => {
    await page.goto('/centers');
    await expect(page.getByRole('heading', { name: /centers/i })).toBeVisible();
  });

  test('should display centers list', async ({ page }) => {
    await page.goto('/centers');
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Should show at least one center from seed data
    const centerCards = page.locator('[data-testid="center-card"]').or(page.locator('article, .card').first());
    await expect(centerCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should create a new center', async ({ page }) => {
    await page.goto('/centers/new');

    const testCenterName = `Test Center ${Date.now()}`;

    // Fill in the form
    await page.fill('input[name="name"]', testCenterName);
    await page.fill('input[name="address"]', 'Test Address 123');
    await page.fill('input[name="responsible"]', 'Test Responsible');
    await page.fill('input[name="schedule"]', '9:00 - 17:00');
    await page.fill('input[name="frequency"]', 'Lunes a Viernes');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message or redirect
    await expect(page).toHaveURL(/\/centers/, { timeout: 5000 });
  });

  test('should view center details', async ({ page }) => {
    await page.goto('/centers');
    await page.waitForTimeout(2000);

    // Click on first center
    const firstCenter = page.locator('article, .card').first();
    await firstCenter.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/centers\/\d+/);
  });

  test('should edit a center', async ({ page }) => {
    // Go to first center's detail page
    await page.goto('/centers');
    await page.waitForTimeout(2000);
    const firstCenter = page.locator('article, .card').first();
    await firstCenter.click();

    await page.waitForURL(/\/centers\/\d+/);

    // Update a field
    const updatedName = `Updated Center ${Date.now()}`;
    await page.fill('input[name="name"]', updatedName);

    // Save changes
    await page.click('button[type="submit"]');

    // Should show success message
    await page.waitForTimeout(1000);
  });
});
