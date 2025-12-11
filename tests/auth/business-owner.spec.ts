import { test, expect } from '@playwright/test';
import { AuthHelper, generateTestUser } from '../helpers/auth';

test.describe('Business Owner Authentication', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should display login page with user type selection', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Should see user type buttons
    await expect(page.locator('button', { hasText: 'Business Owner' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Staff Member' })).toBeVisible();
    
    // Should see login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should require user type selection before login', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Try to submit without selecting user type
    await authHelper.fillLoginForm('test@example.com', 'password');
    await authHelper.submitLoginForm();
    
    // Login button should be disabled or show error
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await authHelper.goToLogin();
    await authHelper.selectUserType('business');
    
    // Test with invalid email
    await authHelper.fillLoginForm('invalid-email', 'password');
    await authHelper.submitLoginForm();
    
    // Should show validation error
    await authHelper.expectErrorMessage();
  });

  test('should allow business owner signup', async ({ page }) => {
    const testUser = generateTestUser('business');
    
    await authHelper.signup(testUser);
    
    // Should redirect to setup or dashboard
    await expect(page).toHaveURL(/\/(setup|dashboard).*/);
  });

  test('should prevent signup with existing email', async ({ page }) => {
    const testUser = generateTestUser('business');
    
    // First signup should succeed
    await authHelper.signup(testUser);
    
    // Wait for redirect and then go back to signup
    await page.waitForLoadState('networkidle');
    await authHelper.logout();
    
    // Try to signup again with same email
    await authHelper.signup(testUser);
    
    // Should show error about existing user
    await authHelper.expectErrorMessage();
  });

  test('should switch between login and signup modes', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Should start in login mode
    await expect(page.locator('button', { hasText: 'Sign up' })).toBeVisible();
    
    // Switch to signup mode
    await page.locator('button', { hasText: 'Sign up' }).click();
    
    // Should now show signup form with additional fields
    await expect(page.locator('button', { hasText: 'Sign in' })).toBeVisible();
    
    // Switch back to login mode
    await page.locator('button', { hasText: 'Sign in' }).click();
    
    // Should be back to login mode
    await expect(page.locator('button', { hasText: 'Sign up' })).toBeVisible();
  });

  test('should handle OAuth login flows', async ({ page }) => {
    await authHelper.goToLogin();
    await authHelper.selectUserType('business');
    
    // Should see OAuth buttons
    await expect(page.locator('button', { hasText: /Continue with Google/i })).toBeVisible();
    await expect(page.locator('button', { hasText: /Continue with Facebook/i })).toBeVisible();
    await expect(page.locator('button', { hasText: /Continue with Microsoft/i })).toBeVisible();
    
    // OAuth buttons should be disabled until user type is selected
    const googleButton = page.locator('button', { hasText: /Continue with Google/i });
    await expect(googleButton).not.toBeDisabled();
    
    // Click Google OAuth (will redirect to Google, but we can test the initial flow)
    // Note: In a real test environment, you'd mock the OAuth response
  });

  test('should show forgot password functionality', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Click forgot password link
    await page.locator('button', { hasText: 'Forgot your password?' }).click();
    
    // Should show password reset form
    await expect(page.locator('h2', { hasText: 'Reset Password' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Send Reset Link' })).toBeVisible();
    
    // Test password reset flow
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('button', { hasText: 'Send Reset Link' }).click();
    
    // Should show confirmation message
    await expect(page.locator('h3', { hasText: 'Check your email' })).toBeVisible();
    
    // Should be able to go back to login
    await page.locator('button', { hasText: 'Back to Login' }).click();
    await authHelper.expectToBeLoggedOut();
  });

  test('should persist user type selection during form interactions', async ({ page }) => {
    await authHelper.goToLogin();
    await authHelper.selectUserType('business');
    
    // User type should remain selected when switching forms
    await page.locator('button', { hasText: 'Sign up' }).click();
    
    // Business type should still be selected in signup mode
    await expect(page.locator('button[data-testid="business-type-button"]').or(
      page.locator('button', { hasText: 'Business Owner' })
    )).toHaveClass(/selected|active/);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await authHelper.goToLogin();
    await authHelper.selectUserType('business');
    
    // Simulate network failure
    await page.route('**/auth/v1/**', route => route.abort());
    
    await authHelper.fillLoginForm('test@example.com', 'password');
    await authHelper.submitLoginForm();
    
    // Should show network error message
    await authHelper.expectErrorMessage();
  });

  test('should validate password requirements in signup', async ({ page }) => {
    await authHelper.goToLogin();
    
    // Switch to signup mode
    await page.locator('button', { hasText: 'Sign up' }).click();
    await authHelper.selectUserType('business');
    
    // Test weak password
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('123');
    await page.locator('button[type="submit"]').click();
    
    // Should show password validation error
    await authHelper.expectErrorMessage();
  });
});