import { test } from '@playwright/test';

test('quick visual check', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForSelector('.chat-container');
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({ 
    path: './tmp/screenshots/fixed-contrast-check.png',
    fullPage: true 
  });
  
  // Check handle position
  const handle = page.locator('[data-testid="mcp-drawer-toggle"]');
  const boundingBox = await handle.boundingBox();
  console.log('Handle position after fix:', boundingBox);
});