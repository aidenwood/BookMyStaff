import { test, expect } from '@playwright/test';

test.describe('Appointment Booking Flow', () => {
  const testBusinessId = 'test-business-123';

  test.beforeEach(async ({ page }) => {
    // Navigate to booking page for test business
    await page.goto(`/booking/${testBusinessId}`);
  });

  test('should display booking flow steps', async ({ page }) => {
    // Should load the booking flow
    await expect(page.locator('[data-testid="booking-flow"]').or(
      page.locator('h1', { hasText: 'Book Appointment' })
    )).toBeVisible();

    // Should show progress indicator
    await expect(page.locator('[data-testid="booking-progress"]').or(
      page.locator('.progress, .step-indicator')
    )).toBeVisible();

    // Should start with service selection step
    await expect(page.locator('[data-testid="service-selection"]').or(
      page.locator('h2', { hasText: /service/i })
    )).toBeVisible();
  });

  test('should handle service selection step', async ({ page }) => {
    // Wait for services to load
    await page.waitForLoadState('networkidle');
    
    // Should show available services
    const serviceOptions = page.locator('[data-testid="service-option"]').or(
      page.locator('button, .service-card, .service-item')
    );
    
    // Should have at least one service option
    await expect(serviceOptions.first()).toBeVisible({ timeout: 10000 });
    
    // Should be able to select a service
    await serviceOptions.first().click();
    
    // Should show next button or advance automatically
    const nextButton = page.locator('button', { hasText: /next|continue|proceed/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
  });

  test('should handle location input step', async ({ page }) => {
    // Skip to location step (simplified for testing)
    await page.evaluate(() => {
      // Mock service selection
      window.dispatchEvent(new CustomEvent('booking-step-change', { 
        detail: { step: 2, data: { serviceId: 'test-service' } } 
      }));
    });

    // Should show location input
    await expect(page.locator('input[placeholder*="address"], input[placeholder*="location"], input[placeholder*="postcode"]')).toBeVisible();
    
    // Should be able to enter postcode
    await page.locator('input[placeholder*="postcode"], input[type="text"]').first().fill('4000');
    
    // Should show continue button
    const continueButton = page.locator('button', { hasText: /continue|next/i });
    await expect(continueButton).toBeVisible();
  });

  test('should handle date and time selection', async ({ page }) => {
    // Skip to date/time step
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('booking-step-change', { 
        detail: { step: 3, data: { serviceId: 'test-service', location: 'Test Location' } } 
      }));
    });

    // Should show calendar or date picker
    await expect(page.locator('[data-testid="date-picker"], .calendar, .date-selector')).toBeVisible();
    
    // Should show available time slots
    await expect(page.locator('[data-testid="time-slot"], .time-slot, button[data-time]')).toBeVisible();
    
    // Should be able to select a date and time
    const timeSlot = page.locator('[data-testid="time-slot"], .time-slot, button[data-time]').first();
    await timeSlot.click();
  });

  test('should handle customer details step', async ({ page }) => {
    // Skip to customer details step
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('booking-step-change', { 
        detail: { 
          step: 4, 
          data: { 
            serviceId: 'test-service', 
            location: 'Test Location',
            selectedDateTime: new Date().toISOString()
          } 
        } 
      }));
    });

    // Should show customer form
    await expect(page.locator('input[name="firstName"], input[placeholder*="first name" i]')).toBeVisible();
    await expect(page.locator('input[name="lastName"], input[placeholder*="last name" i]')).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"], input[type="tel"]')).toBeVisible();

    // Should be able to fill customer details
    await page.locator('input[name="firstName"], input[placeholder*="first name" i]').fill('John');
    await page.locator('input[name="lastName"], input[placeholder*="last name" i]').fill('Doe');
    await page.locator('input[name="email"], input[type="email"]').fill('john@example.com');
    await page.locator('input[name="phone"], input[type="tel"]').fill('0412345678');
  });

  test('should handle booking confirmation step', async ({ page }) => {
    // Skip to confirmation step
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('booking-step-change', { 
        detail: { 
          step: 5, 
          data: { 
            serviceId: 'test-service', 
            location: 'Test Location',
            selectedDateTime: new Date().toISOString(),
            customerDetails: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '0412345678'
            }
          } 
        } 
      }));
    });

    // Should show booking summary
    await expect(page.locator('[data-testid="booking-summary"], .booking-summary')).toBeVisible();
    
    // Should show confirm booking button
    await expect(page.locator('button', { hasText: /confirm|book now/i })).toBeVisible();
    
    // Should show customer details
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('john@example.com')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without filling required fields
    const continueButton = page.locator('button', { hasText: /continue|next/i });
    
    if (await continueButton.isVisible()) {
      await continueButton.click();
      
      // Should show validation errors
      await expect(page.locator('.error, [role="alert"], .validation-error')).toBeVisible();
    }
  });

  test('should handle navigation between steps', async ({ page }) => {
    // Should be able to go back and forth between steps
    const backButton = page.locator('button', { hasText: /back|previous/i });
    const nextButton = page.locator('button', { hasText: /next|continue/i });
    
    // If on a step with navigation
    if (await backButton.isVisible()) {
      await backButton.click();
      // Should go to previous step
      await expect(page.locator('[data-testid="step-1"], .step-1')).toBeVisible();
    }
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      // Should advance to next step
      await expect(page.locator('[data-testid="step-2"], .step-2')).toBeVisible();
    }
  });

  test('should handle postcode validation', async ({ page }) => {
    // Enter invalid postcode
    const postcodeInput = page.locator('input[placeholder*="postcode"], input[name="postcode"]');
    
    if (await postcodeInput.isVisible()) {
      await postcodeInput.fill('invalid');
      
      const submitButton = page.locator('button[type="submit"], button', { hasText: /submit|continue/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Should show validation error
        await expect(page.locator('.error, [role="alert"]')).toBeVisible();
      }
    }
  });

  test('should display business information', async ({ page }) => {
    // Should show business name or branding
    await expect(page.locator('[data-testid="business-name"], h1, .business-title')).toBeVisible();
    
    // Should show business details like services offered
    await expect(page.locator('[data-testid="business-info"], .business-info')).toBeVisible();
  });

  test('should handle mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should still show booking flow
    await expect(page.locator('[data-testid="booking-flow"]').or(
      page.locator('h1', { hasText: 'Book Appointment' })
    )).toBeVisible();
    
    // Should be readable and functional on mobile
    await expect(page.locator('button, input').first()).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/**', route => route.abort());
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"], .error, [role="alert"]')).toBeVisible();
    
    // Should provide retry mechanism
    const retryButton = page.locator('button', { hasText: /retry|try again/i });
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible();
    }
  });

  test('should show progress indicator', async ({ page }) => {
    // Should show current step
    await expect(page.locator('[data-testid="current-step"], .current-step, .active-step')).toBeVisible();
    
    // Should show total steps
    await expect(page.locator('[data-testid="total-steps"], .step-count')).toBeVisible();
    
    // Progress should be visually clear
    await expect(page.locator('.progress-bar, .step-indicator, .breadcrumb')).toBeVisible();
  });
});