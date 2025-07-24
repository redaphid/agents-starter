import { test, expect } from '@playwright/test';

test('visual drawer handle test', async ({ page }) => {
  await page.goto('http://localhost:5174');
  
  // Wait for page to load
  await page.waitForSelector('.chat-container');
  await page.waitForTimeout(2000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: './tmp/screenshots/current-drawer-state.png',
    fullPage: true 
  });
  
  // Check if handle exists and get its info
  const drawerToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
  const handleExists = await drawerToggle.count();
  console.log('Handle exists:', handleExists > 0);
  
  if (handleExists > 0) {
    const isVisible = await drawerToggle.isVisible();
    console.log('Handle visible:', isVisible);
    
    const boundingBox = await drawerToggle.boundingBox();
    console.log('Handle bounding box:', boundingBox);
    
    // Try to click the handle
    if (isVisible && boundingBox) {
      await drawerToggle.click();
      await page.waitForTimeout(1000);
      
      // Take screenshot with drawer open
      await page.screenshot({ 
        path: './tmp/screenshots/drawer-opened.png',
        fullPage: true 
      });
    }
  }
  
  // Also check chat container
  const chatContainer = page.locator('.chat-container');
  const chatBounds = await chatContainer.boundingBox();
  console.log('Chat container bounds:', chatBounds);
});