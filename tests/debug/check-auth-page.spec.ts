import { test, expect } from '@playwright/test';

/**
 * Debug test to understand the auth page structure
 */
test('should check auth page structure', async ({ page }) => {
  // Navigate to the auth page
  await page.goto('http://localhost:3000/auth');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  await page.screenshot({ path: 'auth-page-debug.png' });
  
  // Log all visible text
  const allText = await page.textContent('body');
  console.log('Page text:', allText);
  
  // Log all buttons
  const buttons = await page.locator('button').all();
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    const visible = await buttons[i].isVisible();
    console.log(`Button ${i}: "${text}" (visible: ${visible})`);
  }
  
  // Log all inputs
  const inputs = await page.locator('input').all();
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].getAttribute('type');
    const placeholder = await inputs[i].getAttribute('placeholder');
    const visible = await inputs[i].isVisible();
    console.log(`Input ${i}: type="${type}" placeholder="${placeholder}" (visible: ${visible})`);
  }
});