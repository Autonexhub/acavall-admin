import { test, expect } from '@playwright/test';

test('test /centers/new route', async ({ page }) => {
  // Capture console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  // Go directly to centers/new
  await page.goto('/centers/new');

  // Wait a bit for page to load
  await page.waitForTimeout(2000);

  // Take a screenshot
  await page.screenshot({ path: 'test-results/centers-new.png', fullPage: true });

  // Check what's on the page
  const content = await page.content();
  console.log('Page title:', await page.title());
  console.log('Page URL:', page.url());
  console.log('Has form:', content.includes('<form'));
  console.log('Has input:', content.includes('<input'));

  // Check for common elements
  const hasHeading = await page.locator('h1, h2, h3').count();
  console.log('Number of headings:', hasHeading);

  const hasButtons = await page.locator('button').count();
  console.log('Number of buttons:', hasButtons);

  // Print errors
  if (errors.length > 0) {
    console.log('Console errors:', errors.join('\n'));
  }
});

test('test login and then centers/new', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.waitForTimeout(1000);

  await page.fill('input[type="email"]', 'admin@fundacionacavall.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForTimeout(2000);

  // Now go to centers/new
  await page.goto('/centers/new');
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'test-results/centers-new-logged-in.png', fullPage: true });

  console.log('Logged in - Page URL:', page.url());
  console.log('Logged in - Page title:', await page.title());
});
