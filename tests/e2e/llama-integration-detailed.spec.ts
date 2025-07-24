import { test, expect } from '@playwright/test'

test.describe('Llama3.2 Integration - Detailed Bot Response Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('complete llama3.2 connection flow and analyze bot response visuals', async ({ page }) => {
    // STEP 1: Configure llama3.2 connection
    console.log('🔧 Starting llama3.2 configuration...')
    
    const connectionEye = page.locator('.connection-eye')
    await expect(connectionEye).toBeVisible()
    
    // Take initial state screenshot
    await page.screenshot({ 
      path: './tmp/screenshots/integration-01-initial-state.png',
      fullPage: true 
    })
    
    // Open settings modal
    await connectionEye.click()
    await page.waitForTimeout(1000)
    
    // Verify modal opened
    const modal = page.locator('text=Observatory Control Panel')
    await expect(modal).toBeVisible()
    
    await page.screenshot({ 
      path: './tmp/screenshots/integration-02-modal-opened.png',
      fullPage: true 
    })
    
    // STEP 2: Configure Ollama with llama3.2:3b specifically
    console.log('🦙 Configuring Ollama with llama3.2:3b model...')
    
    // Ensure Ollama is selected
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('ollama')
    await page.waitForTimeout(500)
    
    // Set Ollama URL
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    // Wait for models to load and select llama3.2:3b
    await page.waitForTimeout(3000)
    
    // Check if we have a dropdown or need text input
    const modelSelectDropdown = page.locator('select').nth(1)
    const modelTextInput = page.locator('input[placeholder*="deepseek-r1:8b"]')
    
    if (await modelSelectDropdown.isVisible()) {
      console.log('📋 Using model dropdown selection...')
      await modelSelectDropdown.selectOption('llama3.2:3b')
      await page.screenshot({ 
        path: './tmp/screenshots/integration-03a-model-dropdown-selected.png',
        fullPage: true 
      })
    } else if (await modelTextInput.isVisible()) {
      console.log('⌨️ Using model text input...')
      await modelTextInput.clear()
      await modelTextInput.fill('llama3.2:3b')
      await page.screenshot({ 
        path: './tmp/screenshots/integration-03b-model-input-filled.png',
        fullPage: true 
      })
    }
    
    // STEP 3: Save configuration and test connection
    console.log('💾 Saving configuration and testing connection...')
    
    await page.click('text=Save Configuration')
    await page.waitForTimeout(1000)
    
    await page.click('text=Test Connection')
    await page.waitForTimeout(5000) // Give connection test time to complete
    
    // Capture connection test result
    await page.screenshot({ 
      path: './tmp/screenshots/integration-04-connection-test-result.png',
      fullPage: true 
    })
    
    // Check connection status
    const statusText = page.locator('.text-sm.font-medium')
    const statusContent = await statusText.textContent()
    console.log('🔗 Connection status:', statusContent)
    
    // STEP 4: Close modal and attempt chat
    console.log('💬 Closing modal and testing chat interaction...')
    
    await page.click('button[aria-label="Close settings"]')
    await page.waitForTimeout(1000)
    
    // Verify modal closed and capture main interface
    await page.screenshot({ 
      path: './tmp/screenshots/integration-05-modal-closed.png',
      fullPage: true 
    })
    
    // STEP 5: Send a test message to analyze bot response formatting
    console.log('📝 Sending test message to analyze bot response...')
    
    const textarea = page.locator('textarea[placeholder*="Transmit to research station"]')
    const testMessage = 'Hello! Can you explain what you are and how you work? Please provide a detailed response so I can see how the formatting looks.'
    
    await textarea.fill(testMessage)
    await page.screenshot({ 
      path: './tmp/screenshots/integration-06-message-typed.png',
      fullPage: true 
    })
    
    // Send the message
    const sendButton = page.locator('button[aria-label="Send message"]')
    await sendButton.click()
    
    // Wait for response to start appearing
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: './tmp/screenshots/integration-07-response-started.png',
      fullPage: true 
    })
    
    // Wait for complete response (up to 30 seconds)
    console.log('⏳ Waiting for complete bot response...')
    await page.waitForTimeout(30000)
    
    // STEP 6: Analyze the bot response visual formatting
    console.log('🔍 Analyzing bot response visual formatting...')
    
    // Capture full conversation after response
    await page.screenshot({ 
      path: './tmp/screenshots/integration-08-complete-response.png',
      fullPage: true 
    })
    
    // Focus on the message area specifically
    const messagesContainer = page.locator('.space-y-4, .flex.flex-col, [class*="message"]').first()
    if (await messagesContainer.isVisible()) {
      await messagesContainer.screenshot({ 
        path: './tmp/screenshots/integration-09-messages-detail.png'
      })
    }
    
    // Look for specific message elements
    const messageElements = page.locator('[class*="message"], .bg-neutral-100, .bg-blue-100')
    const messageCount = await messageElements.count()
    console.log(`💭 Found ${messageCount} message elements`)
    
    if (messageCount > 0) {
      // Screenshot each message individually to analyze formatting
      for (let i = 0; i < Math.min(messageCount, 5); i++) {
        const message = messageElements.nth(i)
        if (await message.isVisible()) {
          await message.screenshot({ 
            path: `./tmp/screenshots/integration-10-message-${i}.png`
          })
        }
      }
    }
    
    // STEP 7: Test additional interactions to see response formatting
    console.log('🔄 Testing additional message for formatting analysis...')
    
    await textarea.fill('Can you format this response with: 1) A list, 2) Some **bold text**, 3) `code blocks`, and 4) multiple paragraphs?')
    await sendButton.click()
    
    await page.waitForTimeout(20000) // Wait for second response
    
    await page.screenshot({ 
      path: './tmp/screenshots/integration-11-formatted-response.png',
      fullPage: true 
    })
    
    // STEP 8: Document any visual issues found
    console.log('📋 Documenting visual analysis...')
    
    // Check for common visual issues
    const issues = []
    
    // Check for overlapping text
    const overlappingElements = page.locator('[style*="overlap"], [class*="overlap"]')
    if (await overlappingElements.count() > 0) {
      issues.push('overlapping-elements')
    }
    
    // Check for contrast issues (look for light text on light backgrounds)
    const lightText = page.locator('[class*="text-gray-300"], [class*="text-neutral-300"]')
    if (await lightText.count() > 0) {
      issues.push('potential-contrast-issues')
    }
    
    // Check for broken layouts
    const hiddenOverflow = page.locator('[style*="overflow: hidden"]')
    if (await hiddenOverflow.count() > 0) {
      issues.push('hidden-overflow-detected')
    }
    
    console.log('🚨 Visual issues detected:', issues)
    
    // Final comprehensive screenshot
    await page.screenshot({ 
      path: './tmp/screenshots/integration-12-final-state.png',
      fullPage: true 
    })
    
    // Verify connection eye shows connected state
    const finalEyeState = await connectionEye.screenshot({ 
      path: './tmp/screenshots/integration-13-final-eye-state.png'
    })
    
    console.log('✅ Integration test completed. Check screenshots for visual analysis.')
  })

  test('test error handling with invalid model', async ({ page }) => {
    // Test what happens when we try to use a non-existent model
    console.log('❌ Testing error handling with invalid model...')
    
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    
    // Configure with non-existent model
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('ollama')
    
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    // Try to set a model that doesn't exist
    const modelInput = page.locator('input[placeholder*="deepseek-r1:8b"]')
    if (await modelInput.isVisible()) {
      await modelInput.clear()
      await modelInput.fill('nonexistent-model:999b')
    }
    
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    await page.waitForTimeout(5000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/error-handling-invalid-model.png',
      fullPage: true 
    })
    
    // Close modal and try to send message to see error response
    await page.click('button[aria-label="Close settings"]')
    await page.waitForTimeout(1000)
    
    const textarea = page.locator('textarea[placeholder*="Transmit to research station"]')
    await textarea.fill('Test message with invalid model')
    
    const sendButton = page.locator('button[aria-label="Send message"]')
    await sendButton.click()
    
    await page.waitForTimeout(5000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/error-handling-chat-error.png',
      fullPage: true 
    })
  })

  test('test responsive behavior during chat', async ({ page }) => {
    // Test how chat looks at different screen sizes during conversation
    console.log('📱 Testing responsive behavior during chat...')
    
    // Configure llama3.2 first
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('ollama')
    
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    // Set model to llama3.2:3b if dropdown available
    await page.waitForTimeout(2000)
    const modelSelect = page.locator('select').nth(1)
    if (await modelSelect.isVisible()) {
      await modelSelect.selectOption('llama3.2:3b')
    }
    
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    await page.waitForTimeout(3000)
    await page.click('button[aria-label="Close settings"]')
    
    // Send message and test at different viewport sizes
    const textarea = page.locator('textarea[placeholder*="Transmit to research station"]')
    await textarea.fill('This is a test of responsive chat behavior. Please provide a medium-length response.')
    
    const sendButton = page.locator('button[aria-label="Send message"]')
    await sendButton.click()
    
    // Desktop view
    await page.waitForTimeout(10000)
    await page.screenshot({ 
      path: './tmp/screenshots/responsive-desktop-chat.png',
      fullPage: true 
    })
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: './tmp/screenshots/responsive-tablet-chat.png',
      fullPage: true 
    })
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: './tmp/screenshots/responsive-mobile-chat.png',
      fullPage: true 
    })
    
    // Send another message on mobile to test input behavior
    await textarea.fill('Testing mobile input behavior')
    await sendButton.click()
    await page.waitForTimeout(5000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/responsive-mobile-second-message.png',
      fullPage: true 
    })
  })
})