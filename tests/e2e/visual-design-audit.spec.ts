import { test, expect } from '@playwright/test'

test.describe('Observatory Interface Visual Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('capture initial page state - disconnected', async ({ page }) => {
    // Capture full page in disconnected state
    await page.screenshot({ 
      path: './tmp/screenshots/01-initial-disconnected-state.png',
      fullPage: true 
    })
    
    // Focus on the connection eye specifically
    const connectionEye = page.locator('.connection-eye')
    await expect(connectionEye).toBeVisible()
    await connectionEye.screenshot({ 
      path: './tmp/screenshots/01a-connection-eye-disconnected.png' 
    })
  })

  test('capture connection eye hover states', async ({ page }) => {
    const connectionEye = page.locator('.connection-eye')
    
    // Normal state
    await connectionEye.screenshot({ 
      path: './tmp/screenshots/02a-eye-normal.png' 
    })
    
    // Hover state
    await connectionEye.hover()
    await page.waitForTimeout(500) // Let animations settle
    await connectionEye.screenshot({ 
      path: './tmp/screenshots/02b-eye-hover.png' 
    })
    
    // Click to open modal
    await connectionEye.click()
    await page.waitForTimeout(1000) // Let modal animation complete
  })

  test('capture LLM settings modal - all states', async ({ page }) => {
    // Open settings modal
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    
    // Modal should be visible
    const modal = page.locator('text=Observatory Control Panel')
    await expect(modal).toBeVisible()
    
    // Capture initial modal state
    await page.screenshot({ 
      path: './tmp/screenshots/03a-modal-initial-ollama.png',
      fullPage: true 
    })
    
    // Test Ollama provider form states
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    const modelSelect = page.locator('select')
    
    // Focus states
    await ollamaUrl.focus()
    await page.screenshot({ 
      path: './tmp/screenshots/03b-modal-url-focus.png',
      fullPage: true 
    })
    
    // Wait for models to load and capture dropdown
    await page.waitForTimeout(2000)
    if (await modelSelect.isVisible()) {
      await modelSelect.focus()
      await page.screenshot({ 
        path: './tmp/screenshots/03c-modal-model-dropdown.png',
        fullPage: true 
      })
      
      // Open dropdown to see options
      await modelSelect.click()
      await page.waitForTimeout(500)
      await page.screenshot({ 
        path: './tmp/screenshots/03d-modal-model-options.png',
        fullPage: true 
      })
    }
    
    // Test connection button states
    const testButton = page.locator('text=Test Connection')
    await testButton.hover()
    await page.screenshot({ 
      path: './tmp/screenshots/03e-modal-test-button-hover.png',
      fullPage: true 
    })
    
    // Switch to Cloudflare provider
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('cloudflare')
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/03f-modal-cloudflare-provider.png',
      fullPage: true 
    })
  })

  test('capture responsive behavior at different viewport sizes', async ({ page }) => {
    const connectionEye = page.locator('.connection-eye')
    
    // Desktop size (default)
    await page.screenshot({ 
      path: './tmp/screenshots/04a-responsive-desktop.png',
      fullPage: true 
    })
    
    // Tablet size
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/04b-responsive-tablet.png',
      fullPage: true 
    })
    
    // Open modal on tablet
    await connectionEye.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: './tmp/screenshots/04c-responsive-tablet-modal.png',
      fullPage: true 
    })
    
    // Close modal and test mobile
    await page.locator('button[aria-label="Close settings"]').click()
    await page.waitForTimeout(500)
    
    // Mobile size
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    await page.screenshot({ 
      path: './tmp/screenshots/04d-responsive-mobile.png',
      fullPage: true 
    })
    
    // Open modal on mobile
    await connectionEye.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: './tmp/screenshots/04e-responsive-mobile-modal.png',
      fullPage: true 
    })
  })

  test('capture chat interface states', async ({ page }) => {
    // Normal chat interface
    await page.screenshot({ 
      path: './tmp/screenshots/05a-chat-interface-normal.png',
      fullPage: true 
    })
    
    // Focus on textarea
    const textarea = page.locator('textarea[placeholder*="Transmit to research station"]')
    await textarea.focus()
    await page.screenshot({ 
      path: './tmp/screenshots/05b-chat-textarea-focus.png',
      fullPage: true 
    })
    
    // Type a message to see how it looks
    await textarea.fill('Hello, testing the visual design of this interface')
    await page.screenshot({ 
      path: './tmp/screenshots/05c-chat-with-text.png',
      fullPage: true 
    })
    
    // Hover over send button
    const sendButton = page.locator('button[aria-label="Send message"]')
    await sendButton.hover()
    await page.screenshot({ 
      path: './tmp/screenshots/05d-chat-send-hover.png',
      fullPage: true 
    })
  })

  test('capture error states and edge cases', async ({ page }) => {
    // Open settings and test connection with invalid URL
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.click()
    
    const ollamaUrl = page.locator('input[placeholder*="localhost:11434"]')
    await ollamaUrl.clear()
    await ollamaUrl.fill('http://invalid-url:9999')
    
    // Save and test connection
    await page.click('text=Save Configuration')
    await page.click('text=Test Connection')
    
    // Wait for error to appear
    await page.waitForTimeout(3000)
    await page.screenshot({ 
      path: './tmp/screenshots/06a-error-state-invalid-url.png',
      fullPage: true 
    })
    
    // Test with missing fields in Cloudflare
    const providerSelect = page.locator('select').first()
    await providerSelect.selectOption('cloudflare')
    await page.waitForTimeout(500)
    
    await page.click('text=Test Connection')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: './tmp/screenshots/06b-error-state-missing-cloudflare-fields.png',
      fullPage: true 
    })
  })

  test('capture dark mode if available', async ({ page }) => {
    // Check if there's a theme toggle
    const themeToggle = page.locator('[aria-label*="theme"], [aria-label*="dark"], [aria-label*="mode"]')
    
    if (await themeToggle.isVisible()) {
      // Capture light mode first
      await page.screenshot({ 
        path: './tmp/screenshots/07a-light-mode.png',
        fullPage: true 
      })
      
      // Switch to dark mode
      await themeToggle.click()
      await page.waitForTimeout(500)
      await page.screenshot({ 
        path: './tmp/screenshots/07b-dark-mode.png',
        fullPage: true 
      })
      
      // Open modal in dark mode
      const connectionEye = page.locator('.connection-eye')
      await connectionEye.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ 
        path: './tmp/screenshots/07c-dark-mode-modal.png',
        fullPage: true 
      })
    } else {
      console.log('No theme toggle found - capturing current theme only')
      await page.screenshot({ 
        path: './tmp/screenshots/07a-current-theme.png',
        fullPage: true 
      })
    }
  })

  test('capture accessibility focus indicators', async ({ page }) => {
    // Use keyboard navigation to test focus indicators
    
    // Tab through the interface
    await page.keyboard.press('Tab')
    await page.screenshot({ 
      path: './tmp/screenshots/08a-keyboard-focus-1.png',
      fullPage: true 
    })
    
    await page.keyboard.press('Tab')
    await page.screenshot({ 
      path: './tmp/screenshots/08b-keyboard-focus-2.png',
      fullPage: true 
    })
    
    await page.keyboard.press('Tab')
    await page.screenshot({ 
      path: './tmp/screenshots/08c-keyboard-focus-3.png',
      fullPage: true 
    })
    
    // Open modal with Enter key
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1000)
    
    // Tab through modal elements
    await page.keyboard.press('Tab')
    await page.screenshot({ 
      path: './tmp/screenshots/08d-modal-keyboard-focus.png',
      fullPage: true 
    })
  })

  test('capture detailed component closeups', async ({ page }) => {
    // High-detail shots of individual components for pixel-level analysis
    
    const connectionEye = page.locator('.connection-eye')
    await connectionEye.screenshot({ 
      path: './tmp/screenshots/09a-connection-eye-detail.png',
      // Ensure we capture sufficient context around the component
    })
    
    // Open modal for detailed component shots
    await connectionEye.click()
    await page.waitForTimeout(1000)
    
    // Modal header detail
    const modalHeader = page.locator('text=Observatory Control Panel').locator('..')
    await modalHeader.screenshot({ 
      path: './tmp/screenshots/09b-modal-header-detail.png' 
    })
    
    // Form elements detail
    const formSection = page.locator('.space-y-4')
    await formSection.screenshot({ 
      path: './tmp/screenshots/09c-form-elements-detail.png' 
    })
    
    // Button section detail
    const buttonSection = page.locator('.flex.gap-2')
    await buttonSection.screenshot({ 
      path: './tmp/screenshots/09d-buttons-detail.png' 
    })
  })
})