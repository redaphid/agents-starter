import { test, expect } from '@playwright/test';

test('drawer handle is properly attached to chat container', async ({ page }) => {
  await page.goto('http://localhost:5174');
  
  // Wait for chat container to be ready
  await page.waitForSelector('.chat-container');
  
  // Get chat container dimensions
  const chatContainer = page.locator('.chat-container');
  const chatBox = await chatContainer.boundingBox();
  expect(chatBox).toBeTruthy();
  
  // Get drawer toggle dimensions
  const drawerToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
  await expect(drawerToggle).toBeVisible();
  
  const toggleBox = await drawerToggle.boundingBox();
  expect(toggleBox).toBeTruthy();
  
  // Test: Handle should be positioned within the chat container's left area
  // The handle is in the first grid column, so it should be between chat.x and chat.x + handleWidth
  const handleWidth = 24; // 1.5rem ≈ 24px
  const withinChatLeft = toggleBox!.x >= chatBox!.x && toggleBox!.x <= (chatBox!.x + handleWidth + 10);
  
  console.log(`Handle x: ${toggleBox!.x}, Chat x: ${chatBox!.x}, Within range: ${withinChatLeft}`);
  expect(withinChatLeft).toBe(true);
  
  // Test: Handle should be vertically aligned within chat container
  expect(toggleBox!.y).toBeGreaterThan(chatBox!.y);
  expect(toggleBox!.y + toggleBox!.height).toBeLessThan(chatBox!.y + chatBox!.height);
  
  // Test: Handle height should be about 60% of chat height
  const expectedHeight = chatBox!.height * 0.6;
  const heightTolerance = 20; // 20px tolerance
  expect(Math.abs(toggleBox!.height - expectedHeight)).toBeLessThan(heightTolerance);
  
  console.log('✅ Chat container position:', { x: chatBox!.x, y: chatBox!.y, width: chatBox!.width, height: chatBox!.height });
  console.log('✅ Drawer toggle position:', { x: toggleBox!.x, y: toggleBox!.y, width: toggleBox!.width, height: toggleBox!.height });
  console.log(`✅ Handle is attached: ${Math.abs(toggleBox!.x - expectedLeft) < tolerance ? 'YES' : 'NO'}`);
  
  // Test: Click the handle to open drawer
  await drawerToggle.click();
  
  // Wait for drawer to open
  await page.waitForSelector('.drawer-content.open');
  
  // Get drawer dimensions
  const drawer = page.locator('.drawer-content.open');
  const drawerBox = await drawer.boundingBox();
  expect(drawerBox).toBeTruthy();
  
  // Test: Drawer should be positioned at chat container location
  expect(Math.abs(drawerBox!.x - chatBox!.x)).toBeLessThan(tolerance);
  expect(Math.abs(drawerBox!.y - chatBox!.y)).toBeLessThan(tolerance);
  
  // Test: Drawer height should match chat height
  expect(Math.abs(drawerBox!.height - chatBox!.height)).toBeLessThan(tolerance);
  
  // Test: Drawer width should be about 40% of chat width
  const expectedDrawerWidth = chatBox!.width * 0.4;
  expect(Math.abs(drawerBox!.width - expectedDrawerWidth)).toBeLessThan(20);
  
  console.log('✅ Drawer position when open:', { x: drawerBox!.x, y: drawerBox!.y, width: drawerBox!.width, height: drawerBox!.height });
  console.log(`✅ Drawer matches chat dimensions: ${Math.abs(drawerBox!.height - chatBox!.height) < tolerance ? 'YES' : 'NO'}`);
  
  // Take final screenshot
  await page.screenshot({ 
    path: './tmp/screenshots/drawer-attachment-test.png',
    fullPage: true 
  });
});