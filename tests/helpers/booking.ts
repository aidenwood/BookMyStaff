import { Page, expect } from '@playwright/test';

export class BookingHelper {
  constructor(private page: Page) {}

  async goToBookingPage(businessId?: string) {
    if (businessId) {
      await this.page.goto(`/booking/${businessId}`);
    } else {
      // Go to public booking page or demo
      await this.page.goto('/book');
    }
  }

  async fillCustomerDetails(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  }) {
    await this.page.locator('input[name="name"], input[placeholder*="name" i]').fill(data.name);
    await this.page.locator('input[name="email"], input[placeholder*="email" i]').fill(data.email);
    
    if (data.phone) {
      await this.page.locator('input[name="phone"], input[placeholder*="phone" i]').fill(data.phone);
    }
    
    if (data.address) {
      await this.page.locator('input[name="address"], textarea[name="address"]').fill(data.address);
    }
  }

  async selectService(serviceName: string) {
    // Look for service selection by name or data attribute
    const serviceOption = this.page.locator(`[data-testid="service-${serviceName}"]`).or(
      this.page.locator('.service-option', { hasText: serviceName })
    ).or(
      this.page.locator('button', { hasText: serviceName })
    );
    
    await serviceOption.click();
  }

  async selectRegion(regionName: string) {
    // Look for region selection
    const regionOption = this.page.locator(`[data-testid="region-${regionName}"]`).or(
      this.page.locator('.region-option', { hasText: regionName })
    ).or(
      this.page.locator('button', { hasText: regionName })
    );
    
    await regionOption.click();
  }

  async selectDate(date: Date) {
    // Click date picker
    await this.page.locator('[data-testid="date-picker"], .date-picker, input[type="date"]').click();
    
    // Format date for input
    const dateString = date.toISOString().split('T')[0];
    await this.page.locator('input[type="date"]').fill(dateString);
    
    // Alternative: click specific date in calendar
    const dayNumber = date.getDate().toString();
    const dateElement = this.page.locator(`.calendar-day[data-date="${dateString}"]`).or(
      this.page.locator('.calendar-day', { hasText: dayNumber })
    );
    
    if (await dateElement.isVisible()) {
      await dateElement.click();
    }
  }

  async selectTimeSlot(time: string) {
    // Look for time slot button
    const timeSlot = this.page.locator(`[data-testid="time-${time}"]`).or(
      this.page.locator('.time-slot', { hasText: time })
    ).or(
      this.page.locator('button', { hasText: time })
    );
    
    await timeSlot.click();
  }

  async selectStaff(staffName: string) {
    // Look for staff selection
    const staffOption = this.page.locator(`[data-testid="staff-${staffName}"]`).or(
      this.page.locator('.staff-option', { hasText: staffName })
    ).or(
      this.page.locator('button', { hasText: staffName })
    );
    
    await staffOption.click();
  }

  async addNotes(notes: string) {
    await this.page.locator('textarea[name="notes"], textarea[placeholder*="note" i]').fill(notes);
  }

  async submitBooking() {
    const submitButton = this.page.locator('button[type="submit"]').or(
      this.page.locator('button', { hasText: 'Book Now' })
    ).or(
      this.page.locator('button', { hasText: 'Confirm Booking' })
    );
    
    await submitButton.click();
  }

  async createBooking(data: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    serviceName: string;
    regionName?: string;
    date: Date;
    time: string;
    staffName?: string;
    notes?: string;
    address?: string;
  }) {
    // Fill customer details
    await this.fillCustomerDetails({
      name: data.customerName,
      email: data.customerEmail,
      phone: data.customerPhone,
      address: data.address,
    });

    // Select service
    await this.selectService(data.serviceName);

    // Select region if provided
    if (data.regionName) {
      await this.selectRegion(data.regionName);
    }

    // Select date
    await this.selectDate(data.date);

    // Select time
    await this.selectTimeSlot(data.time);

    // Select staff if provided
    if (data.staffName) {
      await this.selectStaff(data.staffName);
    }

    // Add notes if provided
    if (data.notes) {
      await this.addNotes(data.notes);
    }

    // Submit booking
    await this.submitBooking();
  }

  async expectBookingConfirmation() {
    // Look for confirmation message or page
    const confirmation = this.page.locator('[data-testid="booking-confirmation"]').or(
      this.page.locator('.booking-confirmation')
    ).or(
      this.page.locator('h1, h2', { hasText: 'Booking Confirmed' })
    ).or(
      this.page.locator('.success', { hasText: 'confirmed' })
    );

    await expect(confirmation).toBeVisible();
  }

  async expectBookingError(message?: string) {
    const errorElement = this.page.locator('[data-testid="booking-error"]').or(
      this.page.locator('.error, .alert-error, [role="alert"]').first()
    );
    
    await expect(errorElement).toBeVisible();
    
    if (message) {
      await expect(errorElement).toContainText(message);
    }
  }

  async expectServiceVisible(serviceName: string) {
    const service = this.page.locator(`[data-testid="service-${serviceName}"]`).or(
      this.page.locator('.service-option', { hasText: serviceName })
    );
    
    await expect(service).toBeVisible();
  }

  async expectTimeSlotAvailable(time: string) {
    const timeSlot = this.page.locator(`[data-testid="time-${time}"]`).or(
      this.page.locator('.time-slot', { hasText: time })
    );
    
    await expect(timeSlot).toBeVisible();
    await expect(timeSlot).not.toBeDisabled();
  }

  async expectTimeSlotUnavailable(time: string) {
    const timeSlot = this.page.locator(`[data-testid="time-${time}"]`).or(
      this.page.locator('.time-slot', { hasText: time })
    );
    
    // Should either be disabled or not visible
    if (await timeSlot.isVisible()) {
      await expect(timeSlot).toBeDisabled();
    }
  }
}

// Generate test booking data
export function generateTestBooking(date?: Date) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const bookingDate = date || new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  
  return {
    customerName: `Test Customer ${random}`,
    customerEmail: `customer-${timestamp}-${random}@test.com`,
    customerPhone: `555-${Math.floor(Math.random() * 9000) + 1000}`,
    serviceName: 'Standard Service',
    regionName: 'Brisbane North',
    date: bookingDate,
    time: '10:00',
    notes: `Test booking created at ${new Date().toISOString()}`,
    address: '123 Test Street, Brisbane, QLD 4000',
  };
}