import { test, expect } from '@playwright/test';

test.describe('Drawer Mechanism', () => {
  test('verifies drawer handle positioning and smooth slide animation', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5175');
    
    // Wait for app to load
    await expect(page.locator('.chat-container')).toBeVisible();
    
    // Take initial screenshot showing closed state
    await page.screenshot({ 
      path: './tmp/screenshots/drawer-closed-state.png',
      fullPage: true 
    });
    
    // Verify drawer handle is positioned at right edge
    const drawerToggle = page.locator('.drawer-toggle');
    await expect(drawerToggle).toBeVisible();
    
    // Check handle position - should be at right edge of screen
    const handleBox = await drawerToggle.boundingBox();
    const viewportSize = page.viewportSize();
    expect(handleBox).toBeTruthy();
    if (handleBox && viewportSize) {
      // Handle should be at the right edge (within a small tolerance)
      expect(handleBox.x + handleBox.width).toBeGreaterThan(viewportSize.width - 5);
      console.log(`Handle position: ${handleBox.x + handleBox.width}, Viewport width: ${viewportSize.width}`);
    }
    
    // Verify initial state - drawer content should be off-screen
    const drawerContent = page.locator('.drawer-content');
    await expect(drawerContent).toBeVisible(); // Element exists but positioned off-screen
    
    // Check that drawer content is initially closed (right: -380px)
    const initialDrawerPosition = await drawerContent.evaluate(el => 
      window.getComputedStyle(el).right
    );
    expect(initialDrawerPosition).toBe('-380px');
    
    // Verify chat container is full width initially
    const chatContainer = page.locator('.chat-container');
    const initialChatBox = await chatContainer.boundingBox();
    expect(initialChatBox).toBeTruthy();
    
    // Click the drawer handle to open
    await drawerToggle.click();
    
    // Wait for animation to complete (400ms transition)
    await page.waitForTimeout(500);
    
    // Take screenshot of open state
    await page.screenshot({ 
      path: './tmp/screenshots/drawer-open-state.png',
      fullPage: true 
    });
    
    // Verify drawer has slid in from right edge
    const openDrawerPosition = await drawerContent.evaluate(el => 
      window.getComputedStyle(el).right
    );
    expect(openDrawerPosition).toBe('0px');
    
    // Verify chat container maintains its size (no resize, just overlay)
    const openChatBox = await chatContainer.boundingBox();
    expect(openChatBox).toBeTruthy();
    if (initialChatBox && openChatBox) {
      expect(openChatBox.width).toBe(initialChatBox.width);
      expect(openChatBox.height).toBe(initialChatBox.height);
      console.log(`Chat container width maintained: ${openChatBox.width} (initial: ${initialChatBox.width})`);
    }
    
    // Verify drawer has proper shadow overlay effect
    const drawerShadow = await drawerContent.evaluate(el => 
      window.getComputedStyle(el).boxShadow
    );
    expect(drawerShadow).toContain('rgb'); // Should have shadow
    console.log('Drawer shadow:', drawerShadow);
    
    // Verify handle state change (aria-expanded should be true)
    await expect(drawerToggle).toHaveAttribute('aria-expanded', 'true');
    
    // Test closing animation
    await drawerToggle.click();
    
    // Wait for close animation
    await page.waitForTimeout(500);
    
    // Take screenshot of closed state again
    await page.screenshot({ 
      path: './tmp/screenshots/drawer-closed-after-toggle.png',
      fullPage: true 
    });
    
    // Verify drawer slides back off-screen
    const closedDrawerPosition = await drawerContent.evaluate(el => 
      window.getComputedStyle(el).right
    );
    expect(closedDrawerPosition).toBe('-380px');
    
    // Verify handle state change back to false
    await expect(drawerToggle).toHaveAttribute('aria-expanded', 'false');
  });
  
  test('verifies smooth animation timing and no layout shifts', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await expect(page.locator('.chat-container')).toBeVisible();
    
    const chatContainer = page.locator('.chat-container');
    const drawerToggle = page.locator('.drawer-toggle');
    const drawerContent = page.locator('.drawer-content');
    
    // Measure initial positions
    const initialChatBox = await chatContainer.boundingBox();
    
    // Start measuring animation frames
    let animationFrames: number[] = [];
    
    // Open drawer and track position changes
    await drawerToggle.click();
    
    // Sample positions during animation at multiple intervals
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(40); // Sample every 40ms during 400ms animation
      const currentPosition = await drawerContent.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseInt(style.right.replace('px', ''));
      });
      animationFrames.push(currentPosition);
    }
    
    // Wait for animation to complete
    await page.waitForTimeout(200);
    
    console.log('Animation frames (right position):', animationFrames);
    
    // Verify smooth transition (positions should gradually change from -380 to 0)
    expect(animationFrames[0]).toBeLessThan(0); // Should start negative
    expect(animationFrames[animationFrames.length - 1]).toBeGreaterThanOrEqual(-50); // Should be close to 0
    
    // Verify no layout shift in chat container
    const finalChatBox = await chatContainer.boundingBox();
    expect(finalChatBox).toBeTruthy();
    if (initialChatBox && finalChatBox) {
      expect(finalChatBox.x).toBe(initialChatBox.x);
      expect(finalChatBox.y).toBe(initialChatBox.y);
      expect(finalChatBox.width).toBe(initialChatBox.width);
      expect(finalChatBox.height).toBe(initialChatBox.height);
    }
  });
  
  test('verifies drawer content and accessibility', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await expect(page.locator('.chat-container')).toBeVisible();
    
    const drawerToggle = page.locator('.drawer-toggle');
    const drawerContent = page.locator('.drawer-content');
    
    // Open drawer
    await drawerToggle.click();
    await page.waitForTimeout(500);
    
    // Verify drawer contains expected content
    await expect(page.locator('.drawer-title')).toBeVisible();
    await expect(page.locator('.add-url-button')).toBeVisible();
    
    // Test keyboard accessibility
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus management
    const focusedElement = await page.evaluate(() => document.activeElement?.className);
    expect(focusedElement).toBeTruthy();
    
    // Test closing with keyboard (if handle is focusable)
    await drawerToggle.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Should be closed
    const closedPosition = await drawerContent.evaluate(el => 
      window.getComputedStyle(el).right
    );
    expect(closedPosition).toBe('-380px');
  });
});