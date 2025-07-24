import { test, expect } from '@playwright/test';
import { takeScreenshot } from './helpers/screenshot-helper';

test.describe('MCP Agent Communication Test', () => {
  test('communicate with agent using MCP tools', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Take initial screenshot
    await takeScreenshot(page, 'mcp-agent-comm', '01-initial-state');
    
    // Add the MCP server first
    const mcpToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
    await expect(mcpToggle).toBeVisible();
    await mcpToggle.click();
    
    await takeScreenshot(page, 'mcp-agent-comm', '02-mcp-drawer-opened');
    
    // Add new server
    const addButton = page.locator('[data-testid="add-url-button"]');
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Enter the Cloudflare MCP URL
    const urlInput = page.locator('[data-testid="url-input-0"]');
    await expect(urlInput).toBeVisible();
    await urlInput.fill('https://docs.mcp.cloudflare.com/sse');
    
    // Save the URL
    const saveButton = page.locator('[data-testid="save-url-0"]');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for validation
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'mcp-agent-comm', '03-mcp-server-added');
    
    // Close the drawer
    await mcpToggle.click();
    
    // Now test communication with the agent
    const messageInput = page.locator('textarea[placeholder*="Transmit to research station"]');
    await expect(messageInput).toBeVisible();
    
    // Send a message that should trigger MCP tool usage
    const testMessage = 'Search the Cloudflare documentation for information about Workers pricing';
    await messageInput.fill(testMessage);
    
    await takeScreenshot(page, 'mcp-agent-comm', '04-message-entered');
    
    // Send the message
    await page.keyboard.press('Enter');
    
    // Wait for the agent to start responding
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'mcp-agent-comm', '05-message-sent-waiting');
    
    // Wait longer for the full response
    await page.waitForTimeout(10000);
    await takeScreenshot(page, 'mcp-agent-comm', '06-agent-response-partial');
    
    // Wait even longer to see if tools are invoked
    await page.waitForTimeout(15000);
    await takeScreenshot(page, 'mcp-agent-comm', '07-agent-response-complete');
    
    // Check for tool invocation cards
    const toolCards = page.locator('.observatory-achievement-card');
    const toolCardCount = await toolCards.count();
    
    console.log(`Found ${toolCardCount} tool invocation cards`);
    
    if (toolCardCount > 0) {
      await takeScreenshot(page, 'mcp-agent-comm', '08-tools-detected');
      
      // Wait for tool execution to complete
      await page.waitForTimeout(5000);
      await takeScreenshot(page, 'mcp-agent-comm', '09-tools-executed');
    }
    
    // Look for any text indicating MCP tools were used
    const pageContent = await page.content();
    const hasToolMention = pageContent.includes('search') || 
                          pageContent.includes('documentation') || 
                          pageContent.includes('Cloudflare') ||
                          pageContent.includes('pricing');
    
    console.log(`Page contains tool-related content: ${hasToolMention}`);
    
    // Take final screenshot
    await takeScreenshot(page, 'mcp-agent-comm', '10-final-state');
    
    // Log the full conversation
    const messages = page.locator('.message');
    const messageCount = await messages.count();
    console.log(`Total messages in conversation: ${messageCount}`);
    
    for (let i = 0; i < messageCount; i++) {
      const messageText = await messages.nth(i).textContent();
      console.log(`Message ${i}: ${messageText?.substring(0, 200)}...`);
    }
  });
  
  test('test simple echo tool with MCP server', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Configure MCP server (same as before)
    const mcpToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
    await mcpToggle.click();
    
    const addButton = page.locator('[data-testid="add-url-button"]');
    await addButton.click();
    
    const urlInput = page.locator('[data-testid="url-input-0"]');
    await urlInput.fill('https://docs.mcp.cloudflare.com/sse');
    
    const saveButton = page.locator('[data-testid="save-url-0"]');
    await saveButton.click();
    
    await page.waitForTimeout(3000);
    await mcpToggle.click(); // Close drawer
    
    // Test with a simple echo command
    const messageInput = page.locator('textarea[placeholder*="Transmit to research station"]');
    await messageInput.fill('Echo this message: Hello from the cosmic observatory!');
    
    await takeScreenshot(page, 'mcp-agent-comm', '11-echo-test-message');
    
    await page.keyboard.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(8000);
    await takeScreenshot(page, 'mcp-agent-comm', '12-echo-test-response');
    
    // Check if echo tool was invoked
    const toolCards = page.locator('.observatory-achievement-card');
    const echoCards = toolCards.filter({ hasText: 'Echo Protocol' });
    const echoCardCount = await echoCards.count();
    
    console.log(`Found ${echoCardCount} Echo Protocol tool cards`);
    
    if (echoCardCount > 0) {
      await takeScreenshot(page, 'mcp-agent-comm', '13-echo-tool-detected');
    }
  });
  
  test('verify MCP tools are listed in agent capabilities', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Add MCP server
    const mcpToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
    await mcpToggle.click();
    
    const addButton = page.locator('[data-testid="add-url-button"]');
    await addButton.click();
    
    const urlInput = page.locator('[data-testid="url-input-0"]');
    await urlInput.fill('https://docs.mcp.cloudflare.com/sse');
    
    const saveButton = page.locator('[data-testid="save-url-0"]');
    await saveButton.click();
    
    await page.waitForTimeout(3000);
    await mcpToggle.click();
    
    // Ask the agent what tools it has available
    const messageInput = page.locator('textarea[placeholder*="Transmit to research station"]');
    await messageInput.fill('What tools and capabilities do you have available? List them all.');
    
    await takeScreenshot(page, 'mcp-agent-comm', '14-capabilities-question');
    
    await page.keyboard.press('Enter');
    
    // Wait for full response
    await page.waitForTimeout(12000);
    await takeScreenshot(page, 'mcp-agent-comm', '15-capabilities-response');
    
    // Log the response to see what tools are reported
    const lastMessage = page.locator('.message').last();
    const responseText = await lastMessage.textContent();
    console.log('Agent capabilities response:', responseText);
    
    // Check if MCP-related tools are mentioned
    const hasMcpTools = responseText?.toLowerCase().includes('search') || 
                       responseText?.toLowerCase().includes('cloudflare') ||
                       responseText?.toLowerCase().includes('documentation');
    
    console.log(`Agent mentions MCP tools: ${hasMcpTools}`);
  });
});