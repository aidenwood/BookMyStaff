import { Page, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async goToLogin() {
    await this.page.goto('/auth');
  }

  async selectUserType(userType: 'business' | 'staff') {
    // Select user type before login
    await this.page.locator(`[data-testid="${userType}-type-button"]`).click();
    // Alternative selector if data-testid doesn't exist
    await this.page.locator('button', { hasText: userType === 'business' ? 'Business Owner' : 'Staff Member' }).click();
  }

  async fillLoginForm(email: string, password: string) {
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.locator('input[type="password"]').fill(password);
  }

  async submitLoginForm() {
    await this.page.locator('button[type="submit"]').click();
  }

  async login(email: string, password: string, userType: 'business' | 'staff' = 'business') {
    await this.goToLogin();
    await this.selectUserType(userType);
    await this.fillLoginForm(email, password);
    await this.submitLoginForm();
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('**/dashboard*', { timeout: 10000 });
  }

  async fillSignupForm(data: {
    email: string;
    password: string;
    businessName?: string;
    firstName?: string;
    lastName?: string;
  }) {
    await this.page.locator('input[type="email"]').fill(data.email);
    await this.page.locator('input[type="password"]').fill(data.password);
    
    if (data.businessName) {
      await this.page.locator('input[name="businessName"], input[placeholder*="business name" i]').fill(data.businessName);
    }
    
    if (data.firstName) {
      await this.page.locator('input[name="firstName"], input[placeholder*="first name" i]').fill(data.firstName);
    }
    
    if (data.lastName) {
      await this.page.locator('input[name="lastName"], input[placeholder*="last name" i]').fill(data.lastName);
    }
  }

  async submitSignupForm() {
    await this.page.locator('button[type="submit"]').click();
  }

  async signup(data: {
    email: string;
    password: string;
    userType: 'business' | 'staff';
    businessName?: string;
    firstName?: string;
    lastName?: string;
  }) {
    await this.goToLogin();
    
    // Click "Sign up" link to switch to signup mode
    await this.page.locator('button', { hasText: 'Sign up' }).click();
    
    await this.selectUserType(data.userType);
    await this.fillSignupForm(data);
    await this.submitSignupForm();
    
    // Wait for confirmation or redirect
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    // Look for logout button in header or menu
    const logoutButton = this.page.locator('button', { hasText: 'Logout' }).or(
      this.page.locator('button', { hasText: 'Sign out' })
    );
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // If logout is in a dropdown menu
      await this.page.locator('[data-testid="user-menu"]').click();
      await this.page.locator('button', { hasText: 'Logout' }).click();
    }
    
    // Wait for redirect to login
    await this.page.waitForURL('**/auth*');
  }

  async expectToBeLoggedIn() {
    // Should be on dashboard page
    await expect(this.page).toHaveURL(/.*\/dashboard.*/);
    
    // Should have user interface elements
    await expect(this.page.locator('[data-testid="dashboard"]').or(
      this.page.locator('h1', { hasText: 'Dashboard' })
    )).toBeVisible();
  }

  async expectToBeLoggedOut() {
    // Should be on auth page
    await expect(this.page).toHaveURL(/.*\/auth.*/);
    
    // Should have login form
    await expect(this.page.locator('input[type="email"]')).toBeVisible();
    await expect(this.page.locator('input[type="password"]')).toBeVisible();
  }

  async expectErrorMessage(message?: string) {
    const errorElement = this.page.locator('[data-testid="error-message"]').or(
      this.page.locator('.error, .alert-error, [role="alert"]').first()
    );
    
    await expect(errorElement).toBeVisible();
    
    if (message) {
      await expect(errorElement).toContainText(message);
    }
  }
}

// Generate test user data
export function generateTestUser(userType: 'business' | 'staff' = 'business') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return {
    email: `test-${userType}-${timestamp}-${random}@test.com`,
    password: 'TestPassword123!',
    userType,
    businessName: userType === 'business' ? `Test Business ${timestamp}` : undefined,
    firstName: `Test${userType === 'business' ? 'Owner' : 'Staff'}`,
    lastName: `User${random}`,
  };
}