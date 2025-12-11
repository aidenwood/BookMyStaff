import { test, expect } from '@playwright/test';

/**
 * Debug signup flow to see what's happening
 */
test('should debug signup flow', async ({ page }) => {
  const TEST_CREDENTIALS = {
    name: 'Aiden Wood',
    email: 'hi@aidxn.com',
    password: 'aiden123wood',
    business: {
      name: 'Aidxn Design'
    }
  };

  // Navigate to the auth page
  await page.goto('http://localhost:3000/auth');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Switch to signup mode (we start in login mode)
  await page.locator('button', { hasText: 'Sign up' }).click();

  // Wait for signup form to load
  await page.waitForTimeout(1000);

  // Take screenshot after switching to signup
  await page.screenshot({ path: 'debug-signup-1.png' });

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

  // Check the terms checkbox
  await page.locator('input[required][type="checkbox"]').check();

  // Take screenshot before submitting
  await page.screenshot({ path: 'debug-signup-2.png' });

  // Check if submit button is enabled
  const submitButton = page.locator('button[type="submit"]');
  const isEnabled = await submitButton.isEnabled();
  const buttonText = await submitButton.textContent();
  console.log(`Submit button enabled: ${isEnabled}, text: "${buttonText}"`);

  // Check for any error messages
  const errorMessages = await page.locator('.text-red-600, .text-red-500, [class*="error"]').all();
  for (const error of errorMessages) {
    const text = await error.textContent();
    if (text && text.trim()) {
      console.log(`Error message: ${text}`);
    }
  }

  // Submit signup form
  await submitButton.click();

  // Wait a bit to see what happens
  await page.waitForTimeout(3000);

  // Take screenshot after submit
  await page.screenshot({ path: 'debug-signup-3.png' });

  // Log current URL
  console.log(`Current URL after submit: ${page.url()}`);

  // Check for any new error messages
  const newErrorMessages = await page.locator('.text-red-600, .text-red-500, [class*="error"]').all();
  for (const error of newErrorMessages) {
    const text = await error.textContent();
    if (text && text.trim()) {
      console.log(`New error message: ${text}`);
    }
  }
});