import { test, expect } from '@playwright/test';

test('debug handle position and visibility', async ({ page }) => {
  await page.goto('http://localhost:5174');
  
  // Wait for chat container to be ready
  await page.waitForSelector('.chat-container');
  
  // Check if handle exists
  const drawerToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
  const handleExists = await drawerToggle.count();
  console.log('Handle exists:', handleExists > 0);
  
  if (handleExists > 0) {
    // Get handle computed styles
    const styles = await drawerToggle.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        position: computed.position,
        left: computed.left,
        top: computed.top,
        width: computed.width,
        height: computed.height,
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        zIndex: computed.zIndex,
        boundingBox: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        }
      };
    });
    console.log('Handle styles:', JSON.stringify(styles, null, 2));
    
    // Check parent container
    const chatContainer = page.locator('.chat-container');
    const chatStyles = await chatContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        position: computed.position,
        overflow: computed.overflow,
        boundingBox: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        }
      };
    });
    console.log('Chat container styles:', JSON.stringify(chatStyles, null, 2));
    
    // Force show handle for debugging
    await drawerToggle.evaluate(el => {
      (el as HTMLElement).style.background = 'red';
      (el as HTMLElement).style.left = '10px';
      (el as HTMLElement).style.top = '10px';
      (el as HTMLElement).style.width = '50px';
      (el as HTMLElement).style.height = '50px';
      (el as HTMLElement).style.zIndex = '9999';
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.visibility = 'visible';
    });
    
    await page.waitForTimeout(1000);
    
    // Take screenshot with forced visible handle
    await page.screenshot({ 
      path: './tmp/screenshots/debug-handle-forced-visible.png',
      fullPage: true 
    });
    
    // Check if now visible
    const isVisible = await drawerToggle.isVisible();
    console.log('Handle visible after forcing styles:', isVisible);
  }
});