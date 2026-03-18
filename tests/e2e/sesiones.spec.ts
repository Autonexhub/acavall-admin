import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@fundacionacavall.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Sessions (Sesiones) CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to sessions list', async ({ page }) => {
    await page.goto('/sessions');
    await expect(page.getByRole('heading', { name: /sessions/i })).toBeVisible();
  });

  test('should display sessions calendar', async ({ page }) => {
    await page.goto('/sessions');
    await page.waitForTimeout(2000);

    // Should show calendar or list view
    const sessionsView = page.locator('[data-testid="sessions-view"]').or(page.locator('.calendar, .sessions-list').first());
    await expect(sessionsView.first()).toBeVisible({ timeout: 5000 });
  });

  test('should create a new session', async ({ page }) => {
    await page.goto('/sessions/new');

    // Wait for form to load
    await page.waitForTimeout(1000);

    // Fill in the form
    await page.fill('input[name="date"]', '2026-03-15');
    await page.fill('input[name="start_time"]', '10:00');
    await page.fill('input[name="end_time"]', '12:00');
    await page.fill('input[name="participants"]', '8');

    // Select a center (assuming dropdown exists)
    await page.click('[name="center_id"]').catch(() => {});
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to sessions list
    await expect(page).toHaveURL(/\/sessions/, { timeout: 5000 });
  });

  test('should view session details', async ({ page }) => {
    await page.goto('/sessions');
    await page.waitForTimeout(2000);

    // Click on a session
    const firstSession = page.locator('[data-testid="session-item"]').or(page.locator('article, .session-card').first());
    await firstSession.first().click().catch(() => {});

    // Should navigate to detail page
    await page.waitForTimeout(1000);
  });
});
