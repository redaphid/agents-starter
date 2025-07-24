import { test, expect } from '@playwright/test'

test.describe('Ollama Connection Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should show connection eye and allow configuration', async ({ page }) => {
    // Look for the connection eye indicator
    const connectionEye = page.locator('.connection-eye')
    await expect(connectionEye).toBeVisible()
    
    // Click on the connection eye to open settings
    await connectionEye.click()
    
    // Settings modal should open
    const modal = page.locator('text=Observatory Control Panel')
    await expect(modal).toBeVisible()
    
    // Verify Ollama is selected by default
    const providerSelect = page.locator('select')
    await expect(providerSelect).toHaveValue('ollama')
    
    // Configure Ollama settings
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    const ollamaModel = page.locator('input[placeholder*="deepseek-r1:8b"]')
    
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    await ollamaModel.clear()
    await ollamaModel.fill('deepseek-r1:8b')
    
    // Save configuration
    await page.click('text=Save Configuration')
    
    // Test connection
    await page.click('text=Test Connection')
    
    // Wait for connection test to complete
    await page.waitForTimeout(2000)
    
    // Check for success or error message
    const statusText = page.locator('.text-sm.font-medium')
    await expect(statusText).toBeVisible()
    
    const statusContent = await statusText.textContent()
    console.log('Connection status:', statusContent)
    
    // Take a screenshot of the current state
    await page.screenshot({ path: './tmp/screenshots/ollama-connection-test.png' })
  })

  test('should handle chat when LLM is connected', async ({ page }) => {
    // First configure Ollama
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    const ollamaModel = page.locator('input[placeholder*="deepseek-r1:8b"]')
    
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    await ollamaModel.clear()
    await ollamaModel.fill('deepseek-r1:8b')
    
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    
    // Wait for connection
    await page.waitForTimeout(3000)
    
    // Close modal
    await page.click('button[aria-label="Close settings"]')
    
    // Try to send a message
    const textarea = page.locator('textarea[placeholder*="Transmit to research station"]')
    await textarea.fill('Hello, test message')
    
    // Send message
    await page.click('button[aria-label="Send message"]')
    
    // Wait for response or error
    await page.waitForTimeout(5000)
    
    // Take screenshot
    await page.screenshot({ path: './tmp/screenshots/chat-attempt.png' })
    
    // Check if we get Vex's error message or actual response
    const messages = page.locator('.message')
    const messageCount = await messages.count()
    console.log('Message count:', messageCount)
    
    if (messageCount > 0) {
      const lastMessage = messages.last()
      const messageText = await lastMessage.textContent()
      console.log('Last message:', messageText)
    }
  })

  test('should monitor network requests during connection test', async ({ page }) => {
    // Listen for network requests
    const requests: any[] = []
    page.on('request', request => {
      if (request.url().includes('/llm/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        })
      }
    })
    
    page.on('response', response => {
      if (response.url().includes('/llm/')) {
        console.log(`Response: ${response.status()} ${response.url()}`)
      }
    })
    
    // Configure and test connection
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    
    await page.click('text=Test Connection')
    await page.waitForTimeout(3000)
    
    console.log('Network requests made:', requests)
  })
})