import { test } from '@playwright/test';

test('debug drawer visual issues', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForSelector('.chat-container');
  await page.waitForTimeout(1000);
  
  // Take screenshot of closed state
  await page.screenshot({ 
    path: './tmp/screenshots/debug-closed-state.png',
    fullPage: true 
  });
  
  console.log('=== CHECKING HANDLE ICON ===');
  const handleIcon = page.locator('.drawer-icon');
  const iconStyles = await handleIcon.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      transform: computed.transform,
      content: el.textContent
    };
  });
  console.log('Handle icon styles:', iconStyles);
  
  console.log('=== CHECKING Z-INDEX LAYERING ===');
  const chatContainer = page.locator('.chat-container');
  const drawerContent = page.locator('.drawer-content');
  
  const chatZIndex = await chatContainer.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      zIndex: computed.zIndex,
      position: computed.position
    };
  });
  
  const drawerZIndex = await drawerContent.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      zIndex: computed.zIndex,
      position: computed.position
    };
  });
  
  console.log('Chat container z-index:', chatZIndex);
  console.log('Drawer content z-index:', drawerZIndex);
  
  // Click handle to open drawer
  const handle = page.locator('[data-testid="mcp-drawer-toggle"]');
  await handle.click();
  await page.waitForTimeout(1000);
  
  // Take screenshot of open state
  await page.screenshot({ 
    path: './tmp/screenshots/debug-open-state.png',
    fullPage: true 
  });
  
  console.log('=== CHECKING OPEN DRAWER LAYERING ===');
  const openDrawerZIndex = await drawerContent.evaluate(el => {
    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      zIndex: computed.zIndex,
      visibility: computed.visibility,
      transform: computed.transform,
      boundingBox: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      }
    };
  });
  console.log('Open drawer z-index and position:', openDrawerZIndex);
});