import { test, expect } from '@playwright/test'
import { takeScreenshot } from './helpers/test-artifacts'

test.describe('MCP Drawer - URL Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="mcp-drawer-toggle"]', { timeout: 10000 })
  })

  test('drawer starts closed with visible toggle', async ({ page }) => {
    // Drawer should be closed initially
    await expect(page.locator('[data-testid="mcp-drawer"]')).not.toBeVisible()
    
    // Toggle button should be visible
    const toggle = page.locator('[data-testid="mcp-drawer-toggle"]')
    await expect(toggle).toBeVisible()
    
    // Take screenshot of initial state
    await takeScreenshot(page, 'mcp-drawer', 'initial-closed-state')
    
    // Toggle should have proper ARIA attributes
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toHaveAttribute('aria-label', 'Open MCP server configuration')
  })

  test('can open and close drawer', async ({ page }) => {
    const toggle = page.locator('[data-testid="mcp-drawer-toggle"]')
    const drawer = page.locator('[data-testid="mcp-drawer"]')
    
    // Click to open
    await toggle.click()
    await expect(drawer).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    
    // Screenshot open state
    await takeScreenshot(page, 'mcp-drawer', 'drawer-open')
    
    // Click to close
    await toggle.click()
    await expect(drawer).not.toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    
    // Screenshot closed state
    await takeScreenshot(page, 'mcp-drawer', 'drawer-closed-after-interaction')
  })

  test('can add a valid URL', async ({ page }) => {
    // Open drawer
    await page.click('[data-testid="mcp-drawer-toggle"]')
    await expect(page.locator('[data-testid="mcp-drawer"]')).toBeVisible()
    
    // Click add URL button
    await page.click('[data-testid="add-url-button"]')
    
    // New input should appear
    const urlInput = page.locator('[data-testid="url-input-0"]')
    await expect(urlInput).toBeVisible()
    await expect(urlInput).toHaveAttribute('type', 'url')
    await expect(urlInput).toHaveAttribute('required', '')
    
    // Screenshot empty input state
    await takeScreenshot(page, 'mcp-drawer', 'empty-url-input')
    
    // Type a valid URL
    await urlInput.fill('http://localhost:3000/mcp')
    
    // Save the URL
    await page.click('[data-testid="save-url-0"]')
    
    // URL should be saved and displayed
    await expect(page.locator('[data-testid="url-display-0"]')).toContainText('http://localhost:3000/mcp')
    
    // Screenshot with saved URL
    await takeScreenshot(page, 'mcp-drawer', 'url-saved')
  })

  test('validates URL format', async ({ page }) => {
    await page.click('[data-testid="mcp-drawer-toggle"]')
    await page.click('[data-testid="add-url-button"]')
    
    const urlInput = page.locator('[data-testid="url-input-0"]')
    
    // Try invalid URL
    await urlInput.fill('not-a-url')
    await page.click('[data-testid="save-url-0"]')
    
    // Should show validation error
    await expect(page.locator('[data-testid="url-error-0"]')).toContainText('Please enter a valid URL')
    
    // Screenshot validation error
    await takeScreenshot(page, 'mcp-drawer', 'url-validation-error')
  })

  test('can remove a URL', async ({ page }) => {
    // Add a URL first
    await page.click('[data-testid="mcp-drawer-toggle"]')
    await page.click('[data-testid="add-url-button"]')
    await page.fill('[data-testid="url-input-0"]', 'http://localhost:3000/mcp')
    await page.click('[data-testid="save-url-0"]')
    
    // Now remove it
    await page.click('[data-testid="remove-url-0"]')
    
    // URL should be gone
    await expect(page.locator('[data-testid="url-display-0"]')).not.toBeVisible()
    
    // Screenshot after removal
    await takeScreenshot(page, 'mcp-drawer', 'url-removed')
  })

  test('can expand headers section', async ({ page }) => {
    // Add a URL
    await page.click('[data-testid="mcp-drawer-toggle"]')
    await page.click('[data-testid="add-url-button"]')
    await page.fill('[data-testid="url-input-0"]', 'http://localhost:3000/mcp')
    await page.click('[data-testid="save-url-0"]')
    
    // Headers should be collapsed
    await expect(page.locator('[data-testid="headers-section-0"]')).not.toBeVisible()
    
    // Click to expand
    await page.click('[data-testid="expand-headers-0"]')
    
    // Headers section should be visible
    await expect(page.locator('[data-testid="headers-section-0"]')).toBeVisible()
    
    // Screenshot expanded headers
    await takeScreenshot(page, 'mcp-drawer', 'headers-expanded')
  })

  test('can add and remove headers', async ({ page }) => {
    // Setup: Add URL and expand headers
    await page.click('[data-testid="mcp-drawer-toggle"]')
    await page.click('[data-testid="add-url-button"]')
    await page.fill('[data-testid="url-input-0"]', 'http://localhost:3000/mcp')
    await page.click('[data-testid="save-url-0"]')
    await page.click('[data-testid="expand-headers-0"]')
    
    // Add a header
    await page.click('[data-testid="add-header-0"]')
    await page.fill('[data-testid="header-name-0-0"]', 'Authorization')
    await page.fill('[data-testid="header-value-0-0"]', 'Bearer token123')
    
    // Screenshot with header
    await takeScreenshot(page, 'mcp-drawer', 'header-added')
    
    // Remove the header
    await page.click('[data-testid="remove-header-0-0"]')
    
    // Header should be gone
    await expect(page.locator('[data-testid="header-name-0-0"]')).not.toBeVisible()
  })

  test('checks URL reachability', async ({ page }) => {
    await page.click('[data-testid="mcp-drawer-toggle"]')
    await page.click('[data-testid="add-url-button"]')
    
    // Use a URL that should fail reachability
    await page.fill('[data-testid="url-input-0"]', 'http://localhost:99999/unreachable')
    await page.click('[data-testid="save-url-0"]')
    
    // Should show reachability error
    await expect(page.locator('[data-testid="url-status-0"]')).toContainText('Unreachable')
    
    // Screenshot unreachable state
    await takeScreenshot(page, 'mcp-drawer', 'url-unreachable')
  })

  test('keyboard navigation', async ({ page }) => {
    // Open with Enter key
    await page.focus('[data-testid="mcp-drawer-toggle"]')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="mcp-drawer"]')).toBeVisible()
    
    // Close with Escape key
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="mcp-drawer"]')).not.toBeVisible()
  })

  test('click outside to close', async ({ page }) => {
    // Open drawer
    await page.click('[data-testid="mcp-drawer-toggle"]')
    await expect(page.locator('[data-testid="mcp-drawer"]')).toBeVisible()
    
    // Click outside (on the main chat area)
    await page.click('.chat-container', { position: { x: 100, y: 100 } })
    
    // Drawer should close
    await expect(page.locator('[data-testid="mcp-drawer"]')).not.toBeVisible()
  })
})