import { test, expect } from '@playwright/test'
import { startPeriodicScreenshots } from './helpers/screenshot-helper'
import { takeScreenshot } from './helpers/test-artifacts'

test.describe('UI Enhancements Check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[aria-label="Toggle theme"]', { timeout: 10000 })
  })

  test('captures enhanced UI with animations', async ({ page }) => {
    // Start periodic screenshots
    const stopScreenshots = await startPeriodicScreenshots(page, 'enhanced-ui', 'ui-animations', 1000)
    // Check CSS animations are loaded
    const animationsCSS = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets)
      return styles.some(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || [])
          return rules.some(rule => rule.cssText?.includes('fadeInUp'))
        } catch {
          return false
        }
      })
    })
    expect(animationsCSS).toBeTruthy()

    // Send a message to trigger animations
    const input = page.getByPlaceholder('Transmit to research station...')
    await input.fill('Show me the magic of streaming text!')
    
    // Screenshot before sending
    await takeScreenshot(page, 'enhanced-ui', 'ready-to-send')
    
    await input.press('Enter')
    
    // Wait for message to appear with animation
    await page.waitForSelector('.message-user', { timeout: 5000 })
    
    // Screenshot user message with animation
    await takeScreenshot(page, 'enhanced-ui', 'user-message')
    
    // Check if loading button has pulse animation
    const loadingButton = page.locator('.send-button-loading')
    if (await loadingButton.isVisible()) {
      await takeScreenshot(page, 'enhanced-ui', 'loading-pulse', {
        clip: { x: 0, y: 400, width: 1280, height: 200 }
      })
    }

    // Wait a bit for potential AI response
    await page.waitForTimeout(2000)
    
    // Final screenshot
    await takeScreenshot(page, 'enhanced-ui', 'final-state')
    
    // Stop periodic screenshots
    stopScreenshots()
  })

  test('verifies smooth scrolling', async ({ page }) => {
    // Send multiple messages to create scroll
    const input = page.getByPlaceholder('Transmit to research station...')
    
    for (let i = 1; i <= 5; i++) {
      await input.fill(`Message ${i}`)
      await input.press('Enter')
      await page.waitForTimeout(500)
    }
    
    // Check scroll behavior
    const scrollContainer = page.locator('.messages-container')
    const scrollBehavior = await scrollContainer.evaluate(el => 
      window.getComputedStyle(el).scrollBehavior
    )
    expect(scrollBehavior).toBe('smooth')
    
    await takeScreenshot(page, 'enhanced-ui', 'smooth-scroll')
  })

  test('checks hover effects', async ({ page }) => {
    // Send a message first
    const input = page.getByPlaceholder('Transmit to research station...')
    await input.fill('Hover test message')
    await input.press('Enter')
    
    await page.waitForSelector('.message-card')
    
    // Hover over message
    const messageCard = page.locator('.message-card').first()
    await messageCard.hover()
    
    // Check transform on hover
    const transform = await messageCard.evaluate(el => 
      window.getComputedStyle(el).transform
    )
    expect(transform).not.toBe('none')
    
    await takeScreenshot(page, 'enhanced-ui', 'hover-effect')
  })
})