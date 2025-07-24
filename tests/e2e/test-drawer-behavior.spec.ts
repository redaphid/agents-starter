import { test, expect } from '@playwright/test';

test('test actual drawer behavior - click and see what happens', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForSelector('.chat-container');
  await page.waitForTimeout(1000);
  
  console.log('=== INITIAL STATE ===');
  
  // Take screenshot of initial state
  await page.screenshot({ 
    path: './tmp/screenshots/drawer-initial.png',
    fullPage: true 
  });
  
  // Check handle position
  const handle = page.locator('[data-testid="mcp-drawer-toggle"]');
  const handleBox = await handle.boundingBox();
  console.log('Handle position:', handleBox);
  
  // Check drawer position before opening
  const drawer = page.locator('.drawer-content');
  const drawerBoxClosed = await drawer.boundingBox();
  console.log('Drawer position (closed):', drawerBoxClosed);
  
  console.log('=== CLICKING HANDLE ===');
  
  // Click the handle
  await handle.click();
  
  // Wait a moment for animation
  await page.waitForTimeout(500);
  
  // Take screenshot mid-animation
  await page.screenshot({ 
    path: './tmp/screenshots/drawer-mid-animation.png',
    fullPage: true 
  });
  
  // Wait for animation to complete
  await page.waitForTimeout(1000);
  
  console.log('=== AFTER OPENING ===');
  
  // Take screenshot of final state
  await page.screenshot({ 
    path: './tmp/screenshots/drawer-final-open.png',
    fullPage: true 
  });
  
  // Check drawer position after opening
  const drawerBoxOpen = await drawer.boundingBox();
  console.log('Drawer position (open):', drawerBoxOpen);
  
  // Check if drawer is actually visible and where
  const drawerVisible = await drawer.isVisible();
  console.log('Drawer visible:', drawerVisible);
  
  // Check what's covering what
  const chatContainer = page.locator('.chat-container');
  const chatBox = await chatContainer.boundingBox();
  console.log('Chat container position:', chatBox);
  
  // Check z-index values
  const zIndexes = await page.evaluate(() => {
    const chat = document.querySelector('.chat-container');
    const drawer = document.querySelector('.drawer-content');
    const handle = document.querySelector('[data-testid="mcp-drawer-toggle"]');
    
    return {
      chat: window.getComputedStyle(chat).zIndex,
      drawer: window.getComputedStyle(drawer).zIndex,
      handle: window.getComputedStyle(handle).zIndex
    };
  });
  console.log('Z-indexes:', zIndexes);
  
  console.log('=== ANALYSIS ===');
  if (drawerBoxOpen && chatBox) {
    const drawerCoversChat = drawerBoxOpen.x < chatBox.x + chatBox.width;
    console.log('Drawer covers chat:', drawerCoversChat);
    console.log('Drawer left edge:', drawerBoxOpen.x);
    console.log('Chat right edge:', chatBox.x + chatBox.width);
  }
});