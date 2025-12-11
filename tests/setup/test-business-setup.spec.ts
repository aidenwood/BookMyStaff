import { test, expect } from '@playwright/test';

/**
 * Test for setting up the standard test business and business owner
 * This creates a consistent test user that can be used across all tests
 */
test.describe('Test Business Setup', () => {
  const TEST_CREDENTIALS = {
    name: 'Aiden Wood',
    email: 'hi@aidxn.com',
    password: 'aiden123wood',
    business: {
      name: 'Aidxn Design',
      description: 'Creative design and development services',
      phone: '+1234567890',
      address: '123 Design Street, Creative City, CC 12345'
    }
  };

  test('should create test business owner and business', async ({ page }) => {
    // Navigate to the auth page
    await page.goto('http://localhost:3000/auth');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Switch to signup mode (we start in login mode)
    await page.locator('button', { hasText: 'Sign up' }).click();

    // Wait for signup form to load
    await page.waitForTimeout(500);

    // Select Business Owner role (should be "Setup a business" button)
    await page.locator('button', { hasText: 'Setup a business' }).click();

    // Fill all required signup form fields
    await page.locator('input[placeholder="John"]').fill('Aiden');
    await page.locator('input[placeholder="Smith"]').fill('Wood');
    await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
    await page.locator('input[placeholder="Your business name"]').fill(TEST_CREDENTIALS.business.name);
    
    // Fill password fields
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(TEST_CREDENTIALS.password);
    await passwordFields.nth(1).fill(TEST_CREDENTIALS.password);

    // Check the terms checkbox (first one which should be the required terms checkbox in the form)
    await page.locator('input[required][type="checkbox"]').check();

    // Submit signup form
    await page.locator('button[type="submit"]').click();

    // Wait for successful signup and redirect (should go to home page)
    await page.waitForTimeout(3000); // Wait for processing
    await page.waitForLoadState('networkidle');

    // Should redirect to home page after successful signup
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Check that we can navigate to dashboard (verifying we're logged in)
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should be able to access dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Verify we're logged in by looking for user-related content
    const userIndicators = [
      page.locator('text=Dashboard'),
      page.locator('text=Staff'),
      page.locator('text=Bookings'),
      page.locator(`text=${TEST_CREDENTIALS.business.name}`),
      page.locator(`text=${TEST_CREDENTIALS.name}`)
    ];

    // At least one user indicator should be visible on dashboard
    let foundIndicator = false;
    for (const indicator of userIndicators) {
      if (await indicator.isVisible()) {
        foundIndicator = true;
        console.log(`Found indicator: ${await indicator.textContent()}`);
        break;
      }
    }
    expect(foundIndicator).toBe(true);
  });

  test('should login with existing test credentials', async ({ page }) => {
    // Navigate to auth page
    await page.goto('http://localhost:3000/auth');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Should start in login mode, select Business Owner type
    await page.locator('button', { hasText: 'Business Owner' }).click();

    // Fill login form
    await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);

    // Submit login form
    await page.locator('button[type="submit"]').click();

    // Wait for login and redirect
    await page.waitForLoadState('networkidle');

    // Should be logged in and redirected to business area
    await expect(page).toHaveURL(/\/(dashboard|admin|staff|booking).*/);
  });

  test('should handle login with incorrect credentials gracefully', async ({ page }) => {
    // Navigate to auth page
    await page.goto('http://localhost:3000/auth');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Should start in login mode, select Business Owner type
    await page.locator('button', { hasText: 'Business Owner' }).click();

    // Fill login form with wrong password
    await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
    await page.locator('input[type="password"]').fill('wrongpassword');

    // Submit login form
    await page.locator('button[type="submit"]').click();

    // Should show error message
    await expect(page.locator('text=Invalid, text=Error, text=Failed')).toBeVisible({ timeout: 5000 });
  });
});