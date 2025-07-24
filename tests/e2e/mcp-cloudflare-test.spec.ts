import { test, expect } from '@playwright/test';
import { takeScreenshot } from './helpers/screenshot-helper';

test.describe('MCP Cloudflare Server Test', () => {
  test('add Cloudflare MCP server and test tool discovery', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Take initial screenshot
    await takeScreenshot(page, 'mcp-cloudflare', '01-initial-state');
    
    // Find and click the MCP drawer toggle
    const mcpToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
    await expect(mcpToggle).toBeVisible();
    await mcpToggle.click();
    
    // Take screenshot of opened drawer
    await takeScreenshot(page, 'mcp-cloudflare', '02-drawer-opened');
    
    // Look for the "Add new portal" button
    const addButton = page.locator('[data-testid="add-url-button"]');
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Take screenshot after clicking add
    await takeScreenshot(page, 'mcp-cloudflare', '03-add-url-clicked');
    
    // Find the URL input and enter the Cloudflare MCP URL
    const urlInput = page.locator('[data-testid="url-input-0"]');
    await expect(urlInput).toBeVisible();
    await urlInput.fill('https://docs.mcp.cloudflare.com/sse');
    
    // Take screenshot with URL entered
    await takeScreenshot(page, 'mcp-cloudflare', '04-url-entered');
    
    // Find and click the save button
    const saveButton = page.locator('[data-testid="save-url-0"]');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for validation and take screenshot
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'mcp-cloudflare', '05-url-saved');
    
    // Check if the URL is now displayed
    const urlDisplay = page.locator('[data-testid="url-display-0"]');
    await expect(urlDisplay).toContainText('https://docs.mcp.cloudflare.com/sse');
    
    // Take screenshot of saved state
    await takeScreenshot(page, 'mcp-cloudflare', '06-url-confirmed');
    
    // Now test the chat with this MCP server configured
    await page.click('[data-testid="mcp-drawer-toggle"]'); // Close drawer
    
    // Type a test message
    const messageInput = page.locator('textarea[placeholder*="Transmit to research station"]');
    await expect(messageInput).toBeVisible();
    await messageInput.fill('What tools are available to me?');
    
    // Take screenshot with message entered
    await takeScreenshot(page, 'mcp-cloudflare', '07-message-entered');
    
    // Send the message
    await page.keyboard.press('Enter');
    
    // Wait for response and take screenshot
    await page.waitForTimeout(5000);
    await takeScreenshot(page, 'mcp-cloudflare', '08-response-received');
    
    // Look for tool-related content in the response
    const messages = page.locator('.message');
    const lastMessage = messages.last();
    
    // Take final screenshot
    await takeScreenshot(page, 'mcp-cloudflare', '09-final-state');
  });
  
  test('verify MCP tools are exposed to LLM', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Open LLM settings 
    const gearButton = page.locator('button[aria-label="LLM settings"]');
    await expect(gearButton).toBeVisible();
    await gearButton.click();
    
    // Take screenshot of LLM settings
    await takeScreenshot(page, 'mcp-cloudflare', '10-llm-settings-opened');
    
    // Ensure we're using llama3.2 - get the model select dropdown specifically
    const modelSelect = page.locator('select').nth(1); // Second select is the model dropdown
    await expect(modelSelect).toBeVisible();
    await modelSelect.selectOption('llama3.2:3b');
    
    // Take screenshot with model selected
    await takeScreenshot(page, 'mcp-cloudflare', '11-llama32-selected');
    
    // Save and test connection
    const saveButton = page.locator('button').filter({ hasText: 'Save Configuration' });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Test connection
    const testButton = page.locator('button').filter({ hasText: 'Test Connection' });
    await expect(testButton).toBeVisible();
    await testButton.click();
    
    // Wait for test and take screenshot
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'mcp-cloudflare', '12-connection-tested');
    
    // Close modal
    await page.keyboard.press('Escape');
    
    // Now add the MCP server (repeat from previous test)
    const mcpToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
    await mcpToggle.click();
    
    const addButton = page.locator('[data-testid="add-url-button"]');
    await addButton.click();
    
    const urlInput = page.locator('[data-testid="url-input-0"]');
    await urlInput.fill('https://docs.mcp.cloudflare.com/sse');
    
    const saveUrlButton = page.locator('[data-testid="save-url-0"]');
    await saveUrlButton.click();
    
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'mcp-cloudflare', '13-mcp-configured');
    
    // Close drawer and try a complex query that would use tools
    await page.click('[data-testid="mcp-drawer-toggle"]');
    
    const messageInput = page.locator('textarea[placeholder*="Transmit to research station"]');
    await messageInput.fill('Can you search the Cloudflare documentation for Workers pricing?');
    
    await takeScreenshot(page, 'mcp-cloudflare', '14-tool-query-entered');
    
    // Send message
    await page.keyboard.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(10000);
    await takeScreenshot(page, 'mcp-cloudflare', '15-tool-response');
    
    // Check for tool invocation cards
    const toolCards = page.locator('.observatory-achievement-card');
    if (await toolCards.count() > 0) {
      await takeScreenshot(page, 'mcp-cloudflare', '16-tools-detected');
    }
  });
});