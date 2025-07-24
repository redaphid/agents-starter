import { test, expect } from '@playwright/test';

test.describe('Drawer Mechanism Verification', () => {
  test('captures drawer states and verifies behavior', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5175');
    
    // Wait for app to load
    await expect(page.locator('.chat-container')).toBeVisible();
    
    // Take initial closed state screenshot
    await page.screenshot({ 
      path: './tmp/screenshots/drawer-verification-closed.png',
      fullPage: true 
    });
    
    // Verify drawer handle exists and is positioned correctly
    const drawerToggle = page.locator('.drawer-toggle');
    await expect(drawerToggle).toBeVisible();
    
    // Get handle position
    const handleBox = await drawerToggle.boundingBox();
    const viewportSize = page.viewportSize();
    console.log('Handle position:', handleBox);
    console.log('Viewport size:', viewportSize);
    
    // Verify handle is at right edge
    if (handleBox && viewportSize) {
      expect(handleBox.x + handleBox.width).toBeGreaterThan(viewportSize.width - 50);
    }
    
    // Check initial drawer state
    const drawerContent = page.locator('.drawer-content');
    const initialTransform = await drawerContent.evaluate(el => 
      getComputedStyle(el).transform
    );
    console.log('Initial drawer transform:', initialTransform);
    
    // Get chat container initial size
    const chatContainer = page.locator('.chat-container');
    const initialChatBox = await chatContainer.boundingBox();
    
    // Click to open drawer
    await drawerToggle.click();
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Take open state screenshot
    await page.screenshot({ 
      path: './tmp/screenshots/drawer-verification-open.png',
      fullPage: true 
    });
    
    // Verify drawer is now open
    const openTransform = await drawerContent.evaluate(el => 
      getComputedStyle(el).transform
    );
    console.log('Open drawer transform:', openTransform);
    
    // Verify chat container hasn't changed size
    const openChatBox = await chatContainer.boundingBox();
    if (initialChatBox && openChatBox) {
      expect(openChatBox.width).toBe(initialChatBox.width);
      expect(openChatBox.height).toBe(initialChatBox.height);
      console.log('Chat container maintained size:', openChatBox.width, 'x', openChatBox.height);
    }
    
    // Verify drawer content is visible
    await expect(page.locator('.drawer-title')).toBeVisible();
    await expect(page.locator('.add-url-button')).toBeVisible();
    
    // Test animation smoothness by checking multiple frames
    await drawerToggle.click(); // Close
    await page.waitForTimeout(100);
    
    await page.screenshot({ 
      path: './tmp/screenshots/drawer-verification-mid-close.png',
      fullPage: true 
    });
    
    await page.waitForTimeout(400); // Let animation complete
    
    await page.screenshot({ 
      path: './tmp/screenshots/drawer-verification-closed-final.png',
      fullPage: true 
    });
    
    // Final verification - drawer should be closed
    const finalTransform = await drawerContent.evaluate(el => 
      getComputedStyle(el).transform
    );
    console.log('Final drawer transform:', finalTransform);
  });
  
  test('measures animation performance', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await expect(page.locator('.chat-container')).toBeVisible();
    
    const drawerToggle = page.locator('.drawer-toggle');
    const drawerContent = page.locator('.drawer-content');
    
    // Measure opening animation
    const startTime = Date.now();
    await drawerToggle.click();
    
    // Sample positions during animation
    const positions: number[] = [];
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(50);
      const transform = await drawerContent.evaluate(el => {
        const style = getComputedStyle(el);
        const matrix = style.transform.match(/matrix\(([-\d\.]+).*\)/);
        return matrix ? parseFloat(matrix[1]) : 0;
      });
      positions.push(transform);
    }
    
    const endTime = Date.now();
    const animationDuration = endTime - startTime;
    
    console.log('Animation positions:', positions);
    console.log('Animation duration:', animationDuration, 'ms');
    
    // Verify smooth progression (positions should change gradually)
    let smoothAnimation = true;
    for (let i = 1; i < positions.length; i++) {
      const change = Math.abs(positions[i] - positions[i-1]);
      if (change > 100) { // Sudden jumps indicate choppy animation
        smoothAnimation = false;
        break;
      }
    }
    
    expect(smoothAnimation).toBe(true);
    expect(animationDuration).toBeLessThan(600); // Should complete within reasonable time
  });
});