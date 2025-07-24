import { test, expect } from '@playwright/test';
import { takeScreenshot } from './helpers/screenshot-helper';

test.describe('MCP Cloudflare Docs Test', () => {
  test('connect MCP Cloudflare docs server and verify tools with llama3.2', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await takeScreenshot(page, 'mcp-cloudflare-docs', '01-initial-state');
    
    // Step 1: Open the MCP drawer
    console.log('Step 1: Opening MCP drawer...');
    const mcpToggle = page.locator('[data-testid="mcp-drawer-toggle"]');
    await expect(mcpToggle).toBeVisible();
    await mcpToggle.click();
    await takeScreenshot(page, 'mcp-cloudflare-docs', '02-drawer-opened');
    
    // Step 2: Add the Cloudflare MCP URL
    console.log('Step 2: Adding Cloudflare MCP URL...');
    const addButton = page.locator('[data-testid="add-url-button"]');
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    const urlInput = page.locator('[data-testid="url-input-0"]');
    await expect(urlInput).toBeVisible();
    await urlInput.fill('https://docs.mcp.cloudflare.com/sse');
    await takeScreenshot(page, 'mcp-cloudflare-docs', '03-url-entered');
    
    // Step 3: Save and verify connection
    console.log('Step 3: Saving URL and verifying connection...');
    const saveButton = page.locator('[data-testid="save-url-0"]');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for connection verification
    await page.waitForTimeout(5000);
    await takeScreenshot(page, 'mcp-cloudflare-docs', '04-url-saved');
    
    // Check for green status indicator (connection success)
    const statusIndicator = page.locator('[data-testid="url-status-0"]');
    await expect(statusIndicator).toBeVisible();
    const statusText = await statusIndicator.textContent();
    console.log(`Connection status: ${statusText}`);
    
    // Verify the URL is displayed
    const urlDisplay = page.locator('[data-testid="url-display-0"]');
    await expect(urlDisplay).toContainText('https://docs.mcp.cloudflare.com/sse');
    
    // Close the drawer
    await mcpToggle.click();
    await takeScreenshot(page, 'mcp-cloudflare-docs', '05-drawer-closed');
    
    // Step 4: Configure LLM to use llama3.2
    console.log('Step 4: Configuring LLM to use llama3.2...');
    const gearButton = page.locator('button[aria-label="LLM settings"]');
    await expect(gearButton).toBeVisible();
    await gearButton.click();
    await takeScreenshot(page, 'mcp-cloudflare-docs', '06-llm-settings-opened');
    
    // Select llama3.2 model
    const modelSelect = page.locator('select').nth(1); // Model dropdown
    await expect(modelSelect).toBeVisible();
    await modelSelect.selectOption('llama3.2:3b');
    await takeScreenshot(page, 'mcp-cloudflare-docs', '07-llama32-selected');
    
    // Save configuration
    const saveConfigButton = page.locator('button').filter({ hasText: 'Save Configuration' });
    await expect(saveConfigButton).toBeVisible();
    await saveConfigButton.click();
    
    // Test the connection
    const testButton = page.locator('button').filter({ hasText: 'Test Connection' });
    await expect(testButton).toBeVisible();
    await testButton.click();
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'mcp-cloudflare-docs', '08-connection-tested');
    
    // Close the modal
    await page.keyboard.press('Escape');
    await takeScreenshot(page, 'mcp-cloudflare-docs', '09-settings-closed');
    
    // Step 5: Ask the agent about its tools
    console.log('Step 5: Asking agent about tools...');
    const messageInput = page.locator('textarea[placeholder*="Transmit to research station"]');
    await expect(messageInput).toBeVisible();
    
    const toolsQuestion = 'What tools do you have available? Please list all your capabilities and tools.';
    await messageInput.fill(toolsQuestion);
    await takeScreenshot(page, 'mcp-cloudflare-docs', '10-tools-question-entered');
    
    // Send the message
    await page.keyboard.press('Enter');
    console.log('Question sent, waiting for response...');
    
    // Wait for the agent to respond
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'mcp-cloudflare-docs', '11-waiting-for-response');
    
    // Wait longer for full response
    await page.waitForTimeout(10000);
    await takeScreenshot(page, 'mcp-cloudflare-docs', '12-response-received');
    
    // Step 6: Analyze the response for Cloudflare docs mentions
    console.log('Step 6: Analyzing response for Cloudflare docs tools...');
    const messages = page.locator('.message');
    const lastMessage = messages.last();
    const responseText = await lastMessage.textContent();
    
    console.log('Agent response:', responseText);
    
    // Check if the response mentions Cloudflare docs or related tools
    const mentionsCloudflare = responseText?.toLowerCase().includes('cloudflare');
    const mentionsDocs = responseText?.toLowerCase().includes('docs') || responseText?.toLowerCase().includes('documentation');
    const mentionsSearch = responseText?.toLowerCase().includes('search');
    
    console.log(`Response mentions Cloudflare: ${mentionsCloudflare}`);
    console.log(`Response mentions docs/documentation: ${mentionsDocs}`);
    console.log(`Response mentions search: ${mentionsSearch}`);
    
    // Take final screenshot
    await takeScreenshot(page, 'mcp-cloudflare-docs', '13-final-analysis');
    
    // Step 7: Try a specific Cloudflare docs query
    console.log('Step 7: Testing specific Cloudflare docs query...');
    await messageInput.fill('Search the Cloudflare documentation for Workers pricing information');
    await takeScreenshot(page, 'mcp-cloudflare-docs', '14-cloudflare-query-entered');
    
    await page.keyboard.press('Enter');
    
    // Wait for response with potential tool usage
    await page.waitForTimeout(5000);
    await takeScreenshot(page, 'mcp-cloudflare-docs', '15-cloudflare-query-processing');
    
    await page.waitForTimeout(15000);
    await takeScreenshot(page, 'mcp-cloudflare-docs', '16-cloudflare-query-complete');
    
    // Check for tool invocation cards
    const toolCards = page.locator('.observatory-achievement-card');
    const toolCardCount = await toolCards.count();
    console.log(`Tool invocation cards found: ${toolCardCount}`);
    
    if (toolCardCount > 0) {
      // Log details of each tool card
      for (let i = 0; i < toolCardCount; i++) {
        const card = toolCards.nth(i);
        const cardText = await card.textContent();
        console.log(`Tool card ${i}:`, cardText?.substring(0, 200));
      }
      
      await takeScreenshot(page, 'mcp-cloudflare-docs', '17-tools-invoked');
    }
    
    // Get the final response
    const finalMessage = messages.last();
    const finalResponseText = await finalMessage.textContent();
    console.log('Final response to Cloudflare query:', finalResponseText?.substring(0, 500));
    
    await takeScreenshot(page, 'mcp-cloudflare-docs', '18-final-state');
    
    // Expectations
    expect(toolCardCount).toBeGreaterThan(0); // Should have invoked tools
    expect(finalResponseText?.toLowerCase()).toMatch(/cloudflare|workers|pricing|documentation/);
  });
});