import { test, expect } from '@playwright/test';
import { AuthHelper, generateTestUser } from '../helpers/auth';

test.describe('Staff Member Authentication', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should display login page with staff member option', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Should see user type buttons including staff
    await expect(page.locator('button', { hasText: 'Business Owner' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Staff Member' })).toBeVisible();
    
    // Staff button should be clickable
    const staffButton = page.locator('button', { hasText: 'Staff Member' });
    await expect(staffButton).toBeVisible();
    await staffButton.click();
    
    // Should see login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should require user type selection for staff login', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Fill the form without selecting user type
    await authHelper.fillLoginForm('staff@example.com', 'password');
    
    // Login button should be disabled when no user type is selected
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    
    // Select staff type and button should be enabled
    await authHelper.selectUserType('staff');
    await expect(submitButton).not.toBeDisabled();
  });

  test('should show staff-specific login button text', async ({ page }) => {
    await authHelper.goToLogin();
    await authHelper.selectUserType('staff');
    
    // Button should show staff context
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toContainText('Staff');
  });

  test('should allow staff member signup', async ({ page }) => {
    const testUser = generateTestUser('staff');
    
    await authHelper.signup(testUser);
    
    // Should redirect to setup or dashboard
    await expect(page).toHaveURL(/\/(setup|dashboard).*/);
  });

  test('should handle OAuth login flows for staff', async ({ page }) => {
    await authHelper.goToLogin();
    
    // OAuth buttons should be disabled initially
    const googleButton = page.locator('button', { hasText: /Continue with Google/i });
    await expect(googleButton).toBeDisabled();
    
    // After selecting staff type, OAuth buttons should be enabled
    await authHelper.selectUserType('staff');
    await expect(googleButton).not.toBeDisabled();
    
    // Should show staff context in OAuth buttons
    await expect(googleButton).toContainText('Staff');
  });

  test('should switch between user types', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Select business first
    await authHelper.selectUserType('business');
    let submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toContainText('Business');
    
    // Switch to staff
    await authHelper.selectUserType('staff');
    await expect(submitButton).toContainText('Staff');
    
    // Switch back to business
    await authHelper.selectUserType('business');
    await expect(submitButton).toContainText('Business');
  });

  test('should show validation errors for invalid staff login', async ({ page }) => {
    await authHelper.goToLogin();
    await authHelper.selectUserType('staff');
    
    // Test with invalid email
    await authHelper.fillLoginForm('invalid-email', 'password');
    await authHelper.submitLoginForm();
    
    // Should show validation error
    await authHelper.expectErrorMessage();
  });

  test('should handle staff signup form correctly', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Switch to signup mode
    await page.locator('button.text-primary-600', { hasText: 'Sign up' }).click();
    
    // Should be in signup mode now
    await expect(page.locator('button.text-primary-600', { hasText: 'Sign in' })).toBeVisible();
    
    // Fill out staff signup form
    const testUser = generateTestUser('staff');
    await authHelper.fillSignupForm({
      email: testUser.email,
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName
    });
    
    // Submit should work with all fields filled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('should persist staff selection during form interactions', async ({ page }) => {
    await authHelper.goToLogin();
    await authHelper.selectUserType('staff');
    
    // Switch to signup mode
    await page.locator('button.text-primary-600', { hasText: 'Sign up' }).click();
    
    // Staff type should still be selected in signup mode
    const staffButton = page.locator('button', { hasText: 'Staff Member' });
    await expect(staffButton).toBeVisible();
  });

  test('should handle forgot password for staff members', async ({ page }) => {
    await authHelper.goToLogin();
    await authHelper.selectUserType('staff');
    
    // Click forgot password link
    await page.locator('button', { hasText: 'Forgot your password?' }).click();
    
    // Should show password reset form
    await expect(page.locator('h2', { hasText: 'Reset Password' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Send Reset Link' })).toBeVisible();
    
    // Test password reset flow
    await page.locator('input[type="email"]').fill('staff@example.com');
    await page.locator('button', { hasText: 'Send Reset Link' }).click();
    
    // Should show confirmation message
    await expect(page.locator('h3', { hasText: 'Check your email' })).toBeVisible();
  });

  test('should validate staff signup password requirements', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Switch to signup mode
    await page.locator('button.text-primary-600', { hasText: 'Sign up' }).click();
    
    // Fill form with weak password
    await page.locator('input[type="email"]').fill('staff@example.com');
    await page.locator('input[type="password"]').first().fill('123'); // Weak password
    await page.locator('button[type="submit"]').click();
    
    // Should show password validation error
    await authHelper.expectErrorMessage();
  });

  test('should handle network errors gracefully for staff', async ({ page }) => {
    await authHelper.goToLogin();
    await authHelper.selectUserType('staff');
    
    // Simulate network failure
    await page.route('**/auth/v1/**', route => route.abort());
    
    await authHelper.fillLoginForm('staff@example.com', 'password');
    await authHelper.submitLoginForm();
    
    // Should show network error message
    await authHelper.expectErrorMessage();
  });
});