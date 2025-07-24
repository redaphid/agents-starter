import { test, expect } from '@playwright/test';

test('debug drawer handle visibility', async ({ page }) => {
  await page.goto('http://localhost:5174');
  
  // Take a screenshot to see current state
  await page.screenshot({ 
    path: './tmp/screenshots/debug-drawer-handle.png',
    fullPage: true 
  });
  
  // Check if drawer toggle exists
  const drawerToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
  console.log('Drawer toggle exists:', await drawerToggle.count() > 0);
  
  // Check if it's visible
  if (await drawerToggle.count() > 0) {
    console.log('Drawer toggle visible:', await drawerToggle.isVisible());
    const box = await drawerToggle.boundingBox();
    console.log('Drawer toggle position:', box);
  }
  
  // Check if chat container has position relative
  const chatContainer = page.locator('.chat-container');
  if (await chatContainer.count() > 0) {
    const styles = await chatContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        left: computed.left,
        right: computed.right,
        top: computed.top,
        bottom: computed.bottom
      };
    });
    console.log('Chat container styles:', styles);
  }
});