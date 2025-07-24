import { test, expect } from '@playwright/test'

test.describe('Visual Regression - Chat UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for app to load
    await page.waitForSelector('[aria-label="Toggle theme"]', { timeout: 10000 })
  })

  test('captures initial state', async ({ page }) => {
    // Screenshot 1: Current state (may have messages from previous tests)
    await page.screenshot({ 
      path: './tmp/screenshots/1-current-state.png',
      fullPage: true 
    })
    
    // Check if we have the welcome screen or messages
    const messageCount = await page.locator('.message-card').count()
    if (messageCount === 0) {
      await expect(page.getByText('Observatory Transmission Center')).toBeVisible()
    }
    
    // Check interactive elements
    const sendButton = page.getByRole('button', { name: 'Send message' })
    await expect(sendButton).toBeDisabled()
    
    const input = page.getByPlaceholder('Transmit to research station...')
    await expect(input).toBeEnabled()
    // Note: Input may not be auto-focused on page load
  })

  test('captures text input behavior', async ({ page }) => {
    const input = page.getByPlaceholder('Transmit to research station...')
    
    // Screenshot 2: Empty input
    await page.screenshot({ 
      path: './tmp/screenshots/2-empty-input.png',
      clip: { x: 0, y: 400, width: 1280, height: 200 }
    })
    
    // Type text
    await input.fill('Hello, this is a test message')
    
    // Screenshot 3: Text entered
    await page.screenshot({ 
      path: './tmp/screenshots/3-text-entered.png',
      clip: { x: 0, y: 400, width: 1280, height: 200 }
    })
    
    // Check send button is enabled
    const sendButton = page.getByRole('button', { name: 'Send message' })
    await expect(sendButton).toBeEnabled()
  })

  test('captures message sending flow', async ({ page }) => {
    const input = page.getByPlaceholder('Transmit to research station...')
    await input.fill('Test message for visual regression')
    
    // Screenshot 4: Before sending
    await page.screenshot({ 
      path: './tmp/screenshots/4-before-send.png',
      fullPage: true 
    })
    
    // Send message
    await input.press('Enter')
    
    // Wait for message to appear
    await expect(page.getByText('Test message for visual regression')).toBeVisible()
    
    // Screenshot 5: Message sent
    await page.screenshot({ 
      path: './tmp/screenshots/5-message-sent.png',
      fullPage: true 
    })
    
    // Screenshot 6: Loading state (if visible)
    const stopButton = page.getByRole('button', { name: 'Stop generation' })
    if (await stopButton.isVisible()) {
      await page.screenshot({ 
        path: './tmp/screenshots/6-loading-state.png',
        fullPage: true 
      })
    }
  })

  test('captures theme switching', async ({ page }) => {
    // Dark theme (default)
    await page.screenshot({ 
      path: './tmp/screenshots/7-dark-theme.png',
      fullPage: true 
    })
    
    // Switch to light theme
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await page.waitForTimeout(300) // Wait for transition
    
    await page.screenshot({ 
      path: './tmp/screenshots/8-light-theme.png',
      fullPage: true 
    })
  })

  test('captures error states', async ({ page }) => {
    // OpenAI warning is visible
    const warning = page.getByText('OpenAI API Key Not Configured')
    if (await warning.isVisible()) {
      await page.screenshot({ 
        path: './tmp/screenshots/9-api-warning.png',
        fullPage: true 
      })
    }
  })

  test('checks JavaScript errors', async ({ page }) => {
    // Monitor console for errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Perform various interactions
    const input = page.getByPlaceholder('Transmit to research station...')
    await input.fill('Testing for JS errors')
    await input.press('Enter')
    
    // Toggle theme
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    
    // Clear history
    await page.getByRole('button', { name: 'Clear chat history' }).click()
    
    // Wait a bit for any async errors
    await page.waitForTimeout(1000)
    
    // Check for errors
    expect(errors).toHaveLength(0)
  })
})