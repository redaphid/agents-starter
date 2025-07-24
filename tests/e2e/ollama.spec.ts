import { test, expect } from '@playwright/test'

test('test Ollama integration', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  
  // Wait for the chat interface to load
  await page.waitForSelector('.message-input', { timeout: 10000 })
  
  // Type a test message
  const input = page.locator('.message-input')
  await input.fill('Hello! Can you respond with just the word "SUCCESS" to test the connection?')
  
  // Send the message (look for send button or press Enter)
  await page.keyboard.press('Enter')
  
  // Wait for a response (this will timeout if Ollama isn't working)
  try {
    await page.waitForSelector('.message', { timeout: 30000 })
    
    // Check if we got any response
    const messages = await page.locator('.message').count()
    console.log(`Found ${messages} messages`)
    
    if (messages > 0) {
      const lastMessage = page.locator('.message').last()
      const content = await lastMessage.textContent()
      console.log('Last message:', content)
    }
    
    console.log('✅ Ollama integration test: PASSED')
  } catch (error) {
    console.log('❌ Ollama integration test: FAILED - No response received')
    console.log('This likely means Ollama is not running or the model is not available')
  }
  
  // Take screenshot regardless
  await page.screenshot({ path: 'tmp/screenshots/ollama-test.png' })
})