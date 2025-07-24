import { test, expect } from '@playwright/test';

test('test drawer handle click and opening', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForSelector('.chat-container');
  await page.waitForTimeout(1000);
  
  // Take screenshot with handle visible
  await page.screenshot({ 
    path: './tmp/screenshots/handle-visible.png',
    fullPage: true 
  });
  
  // Click the handle
  const handle = page.locator('[data-testid="mcp-drawer-toggle"]');
  await handle.click();
  
  // Wait for drawer to open
  await page.waitForTimeout(1000);
  
  // Take screenshot with drawer open  
  await page.screenshot({ 
    path: './tmp/screenshots/drawer-open.png',
    fullPage: true 
  });
  
  // Verify drawer is open
  const drawer = page.locator('.drawer-content.open');
  await expect(drawer).toBeVisible();
  
  console.log('✅ Drawer handle is visible and clickable!');
  console.log('✅ Drawer opens successfully!');
});