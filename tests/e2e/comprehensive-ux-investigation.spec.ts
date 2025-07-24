import { test, expect } from '@playwright/test'

test.describe('Comprehensive UX Investigation - 10 Critical Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Scenario 1: Modal Positioning and Overlay Issues', async ({ page }) => {
    console.log('🔍 SCENARIO 1: Investigating modal positioning disaster...')
    
    // Capture initial state
    await page.screenshot({ 
      path: './tmp/screenshots/scenario1-01-initial.png',
      fullPage: true 
    })
    
    // Click connection eye to open modal
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    await page.waitForTimeout(1000)
    
    // Capture modal positioning issue - should be centered, likely at bottom
    await page.screenshot({ 
      path: './tmp/screenshots/scenario1-02-modal-positioning-disaster.png',
      fullPage: true 
    })
    
    // Test modal at different viewport sizes to see positioning chaos
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario1-03-desktop-positioning.png',
      fullPage: true 
    })
    
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario1-04-tablet-positioning.png',
      fullPage: true 
    })
    
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario1-05-mobile-positioning-chaos.png',
      fullPage: true 
    })
    
    // Test scrolling behavior with modal open
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario1-06-scroll-behavior-broken.png',
      fullPage: true 
    })
    
    console.log('📊 SCENARIO 1 COMPLETE: Modal positioning issues documented')
  })

  test('Scenario 2: Bot Response Visual Corruption Analysis', async ({ page }) => {
    console.log('🔍 SCENARIO 2: Deep analysis of bot response corruption...')
    
    // Configure connection first
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    
    // Quick setup with llama3.2:3b
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('ollama')
    
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    await page.waitForTimeout(2000) // Let models load
    
    const modelSelect = page.locator('select').nth(1)
    if (await modelSelect.isVisible()) {
      await modelSelect.selectOption('llama3.2:3b')
    }
    
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    await page.waitForTimeout(3000)
    await page.click('button[aria-label="Close settings"]')
    
    // Send messages to trigger various bot response corruptions
    const textarea = page.locator('textarea[placeholder*="Transmit to research station"]')
    const sendButton = page.locator('button[aria-label="Send message"]')
    
    // Test 1: Simple message - capture basic corruption
    await textarea.fill('Hello, can you introduce yourself?')
    await page.screenshot({ 
      path: './tmp/screenshots/scenario2-01-before-simple-message.png',
      fullPage: true 
    })
    
    await sendButton.click()
    await page.waitForTimeout(10000) // Wait for response
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario2-02-simple-response-corruption.png',
      fullPage: true 
    })
    
    // Test 2: Request formatted content - see how badly it breaks
    await textarea.fill('Please provide a response with: 1) A numbered list, 2) **bold text**, 3) `code examples`, and 4) multiple paragraphs')
    await sendButton.click()
    await page.waitForTimeout(15000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario2-03-formatted-content-disaster.png',
      fullPage: true 
    })
    
    // Test 3: Long response - see text overflow issues
    await textarea.fill('Write a detailed explanation of how AI works, including technical details, examples, and multiple sections')
    await sendButton.click()
    await page.waitForTimeout(20000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario2-04-long-response-overflow.png',
      fullPage: true 
    })
    
    // Focus on message area for detailed analysis
    const messagesArea = page.locator('.space-y-4, .flex.flex-col').first()
    if (await messagesArea.isVisible()) {
      await messagesArea.screenshot({ 
        path: './tmp/screenshots/scenario2-05-messages-detail-corruption.png'
      })
    }
    
    console.log('📊 SCENARIO 2 COMPLETE: Bot response corruption documented in detail')
  })

  test('Scenario 3: Mobile Responsive Breakdown Investigation', async ({ page }) => {
    console.log('🔍 SCENARIO 3: Mobile responsive design breakdown...')
    
    // Test multiple mobile viewport sizes
    const mobileViewports = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 360, height: 640, name: 'Android Small' },
      { width: 412, height: 915, name: 'Android Large' }
    ]
    
    for (const viewport of mobileViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500)
      
      // Capture initial mobile state
      await page.screenshot({ 
        path: `./tmp/screenshots/scenario3-01-${viewport.name.toLowerCase().replace(' ', '-')}-initial.png`,
        fullPage: true 
      })
      
      // Open modal on this viewport
      const connectionEye = page.locator('.connection-eye')
      await connectionEye.click()
      await page.waitForTimeout(1000)
      
      await page.screenshot({ 
        path: `./tmp/screenshots/scenario3-02-${viewport.name.toLowerCase().replace(' ', '-')}-modal.png`,
        fullPage: true 
      })
      
      // Test form interaction on mobile
      const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
      await ollamaUrl.focus()
      await page.waitForTimeout(500)
      
      await page.screenshot({ 
        path: `./tmp/screenshots/scenario3-03-${viewport.name.toLowerCase().replace(' ', '-')}-input-focus.png`,
        fullPage: true 
      })
      
      // Close modal for next iteration
      await page.click('button[aria-label="Close settings"]')
      await page.waitForTimeout(500)
    }
    
    console.log('📊 SCENARIO 3 COMPLETE: Mobile responsive issues documented across viewports')
  })

  test('Scenario 4: Connection Flow UX Investigation', async ({ page }) => {
    console.log('🔍 SCENARIO 4: Complete connection flow UX analysis...')
    
    const connectionEye = page.locator('.connection-eye')
    
    // Document each step of connection flow
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-01-disconnected-state.png',
      fullPage: true 
    })
    
    // Step 1: Modal opening animation and state
    await connectionEye.click()
    await page.waitForTimeout(200) // Capture mid-animation
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-02-modal-opening-animation.png',
      fullPage: true 
    })
    
    await page.waitForTimeout(800) // Full open
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-03-modal-fully-open.png',
      fullPage: true 
    })
    
    // Step 2: Provider selection interaction
    const providerSelect = page.locator('select').first()
    await providerSelect.focus()
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-04-provider-select-focus.png',
      fullPage: true 
    })
    
    await providerSelect.selectOption('cloudflare')
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-05-cloudflare-selected.png',
      fullPage: true 
    })
    
    await providerSelect.selectOption('ollama')
    await page.waitForTimeout(1000) // Wait for model loading
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-06-ollama-selected-models-loading.png',
      fullPage: true 
    })
    
    // Step 3: URL configuration UX
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-07-url-configured.png',
      fullPage: true 
    })
    
    // Step 4: Model selection experience
    await page.waitForTimeout(3000) // Ensure models loaded
    const modelSelect = page.locator('select').nth(1)
    if (await modelSelect.isVisible()) {
      await modelSelect.focus()
      await page.screenshot({ 
        path: './tmp/screenshots/scenario4-08-model-select-focus.png',
        fullPage: true 
      })
      
      await modelSelect.selectOption('llama3.2:3b')
      await page.screenshot({ 
        path: './tmp/screenshots/scenario4-09-model-selected.png',
        fullPage: true 
      })
    }
    
    // Step 5: Save configuration UX
    const saveButton = page.locator('text=Save Configuration')
    await saveButton.hover()
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-10-save-button-hover.png',
      fullPage: true 
    })
    
    await saveButton.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-11-configuration-saved.png',
      fullPage: true 
    })
    
    // Step 6: Connection testing UX
    const testButton = page.locator('text=Test Connection')
    await testButton.hover()
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-12-test-button-hover.png',
      fullPage: true 
    })
    
    await testButton.click()
    await page.waitForTimeout(1000) // Capture during testing
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-13-connection-testing.png',
      fullPage: true 
    })
    
    await page.waitForTimeout(4000) // Wait for test completion
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-14-connection-test-result.png',
      fullPage: true 
    })
    
    // Step 7: Modal closing and final state
    await page.click('button[aria-label="Close settings"]')
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario4-15-final-connected-state.png',
      fullPage: true 
    })
    
    console.log('📊 SCENARIO 4 COMPLETE: Connection flow UX thoroughly documented')
  })

  test('Scenario 5: Error State Handling Investigation', async ({ page }) => {
    console.log('🔍 SCENARIO 5: Comprehensive error state analysis...')
    
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    
    // Test 1: Invalid URL error
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://invalid-server:9999')
    
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    await page.waitForTimeout(5000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario5-01-invalid-url-error.png',
      fullPage: true 
    })
    
    // Test 2: Empty fields error
    await ollamaUrl.clear()
    await page.click('text=Test Connection')
    await page.waitForTimeout(2000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario5-02-empty-url-error.png',
      fullPage: true 
    })
    
    // Test 3: Cloudflare missing credentials
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('cloudflare')
    await page.waitForTimeout(500)
    
    await page.click('text=Test Connection')
    await page.waitForTimeout(3000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario5-03-cloudflare-missing-creds.png',
      fullPage: true 
    })
    
    // Test 4: Invalid model error
    await providerSelect.selectOption('ollama')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    const modelInput = page.locator('input[placeholder*="deepseek-r1:8b"]')
    if (await modelInput.isVisible()) {
      await modelInput.clear()
      await modelInput.fill('nonexistent-model:999b')
    }
    
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    await page.waitForTimeout(5000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario5-04-invalid-model-error.png',
      fullPage: true 
    })
    
    // Test 5: Network timeout simulation
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://192.168.1.999:11434') // Non-routable IP
    
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    await page.waitForTimeout(10000) // Wait for timeout
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario5-05-network-timeout-error.png',
      fullPage: true 
    })
    
    console.log('📊 SCENARIO 5 COMPLETE: Error states comprehensively documented')
  })

  test('Scenario 6: Keyboard Navigation and Accessibility', async ({ page }) => {
    console.log('🔍 SCENARIO 6: Keyboard navigation and accessibility audit...')
    
    // Start with fresh page
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-01-initial-state.png',
      fullPage: true 
    })
    
    // Tab through all interactive elements
    await page.keyboard.press('Tab')
    await page.waitForTimeout(300)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-02-first-tab-focus.png',
      fullPage: true 
    })
    
    await page.keyboard.press('Tab')
    await page.waitForTimeout(300)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-03-second-tab-focus.png',
      fullPage: true 
    })
    
    await page.keyboard.press('Tab')
    await page.waitForTimeout(300)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-04-third-tab-focus.png',
      fullPage: true 
    })
    
    // Open modal with keyboard
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-05-modal-opened-keyboard.png',
      fullPage: true 
    })
    
    // Tab through modal elements
    await page.keyboard.press('Tab')
    await page.waitForTimeout(300)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-06-modal-first-element.png',
      fullPage: true 
    })
    
    await page.keyboard.press('Tab')
    await page.waitForTimeout(300)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-07-modal-second-element.png',
      fullPage: true 
    })
    
    await page.keyboard.press('Tab')
    await page.waitForTimeout(300)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-08-modal-third-element.png',
      fullPage: true 
    })
    
    // Test arrow key navigation in dropdowns
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(300)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-09-dropdown-arrow-navigation.png',
      fullPage: true 
    })
    
    // Test Escape key to close modal
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario6-10-escape-key-close.png',
      fullPage: true 
    })
    
    console.log('📊 SCENARIO 6 COMPLETE: Keyboard navigation thoroughly tested')
  })

  test('Scenario 7: Loading States and Micro-interactions', async ({ page }) => {
    console.log('🔍 SCENARIO 7: Loading states and micro-interaction analysis...')
    
    const connectionEye = page.locator('.connection-eye')
    
    // Capture different connection eye states
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-01-eye-disconnected.png',
      fullPage: true 
    })
    
    // Hover state
    await connectionEye.hover()
    await page.waitForTimeout(300)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-02-eye-hover-state.png',
      fullPage: true 
    })
    
    // Click state
    await connectionEye.click()
    await page.waitForTimeout(100) // Capture click feedback
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-03-eye-click-feedback.png',
      fullPage: true 
    })
    
    await page.waitForTimeout(900) // Modal open
    
    // Test model loading states
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('ollama')
    
    // Capture loading state immediately after provider selection
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-04-models-loading-state.png',
      fullPage: true 
    })
    
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-05-models-loaded-state.png',
      fullPage: true 
    })
    
    // Test connection button states
    const testButton = page.locator('text=Test Connection')
    
    // Normal state
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-06-test-button-normal.png',
      fullPage: true 
    })
    
    // Hover state
    await testButton.hover()
    await page.waitForTimeout(200)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-07-test-button-hover.png',
      fullPage: true 
    })
    
    // Configure valid connection first
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    await page.waitForTimeout(2000)
    const modelSelect = page.locator('select').nth(1)
    if (await modelSelect.isVisible()) {
      await modelSelect.selectOption('llama3.2:3b')
    }
    
    await page.click('text=Save Configuration')
    
    // Click and capture loading state
    await testButton.click()
    await page.waitForTimeout(500) // Capture during testing
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-08-connection-testing-loading.png',
      fullPage: true 
    })
    
    await page.waitForTimeout(2500) // Wait for completion
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-09-connection-success-state.png',
      fullPage: true 
    })
    
    // Close modal and check eye state change
    await page.click('button[aria-label="Close settings"]')
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario7-10-eye-connected-state.png',
      fullPage: true 
    })
    
    console.log('📊 SCENARIO 7 COMPLETE: Loading states and interactions documented')
  })

  test('Scenario 8: Typography and Contrast Analysis', async ({ page }) => {
    console.log('🔍 SCENARIO 8: Typography hierarchy and contrast issues...')
    
    // Test different text elements for contrast
    await page.screenshot({ 
      path: './tmp/screenshots/scenario8-01-overall-typography.png',
      fullPage: true 
    })
    
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    await page.waitForTimeout(1000)
    
    // Focus on modal typography
    await page.screenshot({ 
      path: './tmp/screenshots/scenario8-02-modal-typography.png',
      fullPage: true 
    })
    
    // Test form label contrast
    const labels = page.locator('label')
    const labelCount = await labels.count()
    
    if (labelCount > 0) {
      for (let i = 0; i < Math.min(labelCount, 5); i++) {
        const label = labels.nth(i)
        await label.screenshot({ 
          path: `./tmp/screenshots/scenario8-03-label-${i}-contrast.png`
        })
      }
    }
    
    // Test different font weights and sizes
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('cloudflare')
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario8-04-cloudflare-form-typography.png',
      fullPage: true 
    })
    
    await providerSelect.selectOption('ollama')
    await page.waitForTimeout(1000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario8-05-ollama-form-typography.png',
      fullPage: true 
    })
    
    // Test status message typography
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    await page.waitForTimeout(3000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario8-06-status-message-typography.png',
      fullPage: true 
    })
    
    // Close modal and test chat interface typography
    await page.click('button[aria-label="Close settings"]')
    await page.waitForTimeout(500)
    
    const textarea = page.locator('textarea[placeholder*="Transmit to research station"]')
    await textarea.focus()
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario8-07-chat-input-typography.png',
      fullPage: true 
    })
    
    await textarea.fill('Testing typography and text rendering in this interface')
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario8-08-chat-input-with-text.png',
      fullPage: true 
    })
    
    console.log('📊 SCENARIO 8 COMPLETE: Typography and contrast thoroughly analyzed')
  })

  test('Scenario 9: Animation and Visual Feedback Issues', async ({ page }) => {
    console.log('🔍 SCENARIO 9: Animation timing and visual feedback analysis...')
    
    const connectionEye = page.locator('.connection-eye')
    
    // Test connection eye animation states
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-01-eye-static.png',
      fullPage: true 
    })
    
    // Rapid hover on/off to test animation smoothness
    await connectionEye.hover()
    await page.waitForTimeout(100)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-02-eye-hover-start.png',
      fullPage: true 
    })
    
    await page.mouse.move(0, 0) // Move away
    await page.waitForTimeout(100)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-03-eye-hover-end.png',
      fullPage: true 
    })
    
    await connectionEye.hover()
    await page.waitForTimeout(300)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-04-eye-hover-full.png',
      fullPage: true 
    })
    
    // Test modal opening animation at different speeds
    await connectionEye.click()
    await page.waitForTimeout(100) // Very early in animation
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-05-modal-animation-start.png',
      fullPage: true 
    })
    
    await page.waitForTimeout(200) // Mid animation
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-06-modal-animation-mid.png',
      fullPage: true 
    })
    
    await page.waitForTimeout(500) // Near end
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-07-modal-animation-end.png',
      fullPage: true 
    })
    
    // Test form interaction feedback
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    
    // Focus animation
    await ollamaUrl.focus()
    await page.waitForTimeout(100)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-08-input-focus-animation.png',
      fullPage: true 
    })
    
    // Typing feedback
    await ollamaUrl.type('http://localhost:', { delay: 50 })
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-09-typing-feedback.png',
      fullPage: true 
    })
    
    await ollamaUrl.type('11434', { delay: 50 })
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-10-typing-complete.png',
      fullPage: true 
    })
    
    // Button interaction animations
    const saveButton = page.locator('text=Save Configuration')
    await saveButton.hover()
    await page.waitForTimeout(200)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-11-button-hover-animation.png',
      fullPage: true 
    })
    
    await saveButton.click()
    await page.waitForTimeout(100) // Capture click feedback
    await page.screenshot({ 
      path: './tmp/screenshots/scenario9-12-button-click-feedback.png',
      fullPage: true 
    })
    
    console.log('📊 SCENARIO 9 COMPLETE: Animation and feedback issues documented')
  })

  test('Scenario 10: Complex Multi-Step User Journey', async ({ page }) => {
    console.log('🔍 SCENARIO 10: Complete user journey with all problems combined...')
    
    // Simulate a real user's complete journey with all the pain points
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-01-user-arrives.png',
      fullPage: true 
    })
    
    // User confused by connection status
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.hover()
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-02-user-hovers-confused.png',
      fullPage: true 
    })
    
    // User clicks to configure
    await connectionEye.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-03-modal-opens-positioning-issue.png',
      fullPage: true 
    })
    
    // User tries to understand the interface
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-04-user-reading-interface.png',
      fullPage: true 
    })
    
    // User starts configuration process
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('ollama')
    await page.waitForTimeout(1000)
    
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://localhost:11434')
    
    await page.waitForTimeout(2000) // User waits for models to load
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-05-user-configuring-waiting.png',
      fullPage: true 
    })
    
    // User selects model
    const modelSelect = page.locator('select').nth(1)
    if (await modelSelect.isVisible()) {
      await modelSelect.selectOption('llama3.2:3b')
    }
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-06-configuration-complete.png',
      fullPage: true 
    })
    
    // User saves and tests
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    await page.waitForTimeout(4000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-07-connection-tested.png',
      fullPage: true 
    })
    
    // User closes modal
    await page.click('button[aria-label="Close settings"]')
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-08-modal-closed.png',
      fullPage: true 
    })
    
    // User attempts to chat
    const textarea = page.locator('textarea[placeholder*="Transmit to research station"]')
    await textarea.fill('Hello! Can you help me understand how this interface works? Please explain what you are and provide some examples.')
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-09-user-types-message.png',
      fullPage: true 
    })
    
    const sendButton = page.locator('button[aria-label="Send message"]')
    await sendButton.click()
    
    // User waits for response
    await page.waitForTimeout(3000)
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-10-waiting-for-response.png',
      fullPage: true 
    })
    
    await page.waitForTimeout(10000) // Wait for full response
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-11-response-received-corruption.png',
      fullPage: true 
    })
    
    // User tries another message to see if it's consistent
    await textarea.fill('Can you provide a formatted response with lists and code examples?')
    await sendButton.click()
    await page.waitForTimeout(15000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-12-second-response-more-corruption.png',
      fullPage: true 
    })
    
    // User might try mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    
    await page.screenshot({ 
      path: './tmp/screenshots/scenario10-13-mobile-experience-disaster.png',
      fullPage: true 
    })
    
    // User gives up in frustration
    console.log('📊 SCENARIO 10 COMPLETE: Complete user journey with all issues documented')
    console.log('🚨 CRITICAL: User experience is severely broken across all scenarios')
  })
})