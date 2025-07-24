import { test, expect } from '@playwright/test'

test.describe('Portal Button Contrast Test', () => {
  test('should verify fixed portal button contrast and Observatory theming', async ({ page }) => {
    // Navigate to the chat interface
    await page.goto('http://localhost:5173')
    
    // Wait for the interface to load
    await page.waitForLoadState('networkidle')
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: './tmp/screenshots/portal_button_initial.png',
      fullPage: true 
    })
    
    // Click on MCP Drawer to open it
    const drawerToggle = page.locator('[data-testid="mcp-drawer-toggle"]')
    await drawerToggle.click()
    
    // Wait for drawer to open and content to load
    await page.waitForTimeout(1000)
    await page.waitForSelector('[data-testid="add-url-button"]', { state: 'visible' })
    
    // Take screenshot of the MCP drawer with the "Open New Portal" button
    await page.screenshot({ 
      path: './tmp/screenshots/portal_button_fixed.png',
      fullPage: true 
    })
    
    // Locate the "Open New Portal" button by its test ID
    const portalButton = page.locator('[data-testid="add-url-button"]')
    await expect(portalButton).toBeVisible()
    
    // Get computed styles from the actual button element
    const backgroundColor = await portalButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundImage
    )
    const color = await portalButton.evaluate((el) => 
      window.getComputedStyle(el).color
    )
    const boxShadow = await portalButton.evaluate((el) => 
      window.getComputedStyle(el).boxShadow
    )
    
    console.log('Portal Button Styles:')
    console.log('Background Image:', backgroundColor)
    console.log('Text Color:', color)
    console.log('Box Shadow:', boxShadow)
    
    // Test hover state
    await portalButton.hover()
    await page.waitForTimeout(300)
    
    // Take screenshot of hover state
    await page.screenshot({ 
      path: './tmp/screenshots/portal_button_hover.png',
      fullPage: true 
    })
    
    // Get hover styles
    const hoverBackgroundImage = await portalButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundImage
    )
    
    console.log('Hover Background Image:', hoverBackgroundImage)
    
    // Verify Observatory theming is applied
    expect(backgroundColor).toContain('linear-gradient') // Should have cosmic gradient
    expect(color).toContain('oklch') // Should use OKLCH color space
    expect(boxShadow).not.toBe('none') // Should have cosmic glow
    
    // Test button click functionality
    await portalButton.click()
    await page.waitForTimeout(500)
    
    // Take final screenshot after click
    await page.screenshot({ 
      path: './tmp/screenshots/portal_button_clicked.png',
      fullPage: true 
    })
  })
})