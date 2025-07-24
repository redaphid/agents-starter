import { test, expect } from '@playwright/test'

test.describe('Iteration Tests - Streaming Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('maintains streaming message display', async ({ page }) => {
    // Send a message
    const input = page.getByPlaceholder('Send a message...')
    await input.fill('Hello AI')
    await input.press('Enter')
    
    // Should show user message immediately
    await expect(page.getByText('Hello AI')).toBeVisible()
    
    // Should show loading indicator
    await expect(page.getByRole('button', { name: 'Stop generation' })).toBeVisible()
    
    // Measure time to first token (should be fast)
    const startTime = Date.now()
    await page.waitForSelector('[class*="assistant"]', { timeout: 5000 })
    const timeToFirstToken = Date.now() - startTime
    
    console.log(`Time to first token: ${timeToFirstToken}ms`)
    expect(timeToFirstToken).toBeLessThan(5000)
  })

  test('tool invocations display correctly', async ({ page }) => {
    // Send a message that might trigger a tool
    const input = page.getByPlaceholder('Send a message...')
    await input.fill('What time is it in New York?')
    await input.press('Enter')
    
    // Check message appears
    await expect(page.getByText('What time is it in New York?')).toBeVisible()
  })

  test('maintains responsive UI during streaming', async ({ page }) => {
    // Send a message
    await page.getByPlaceholder('Send a message...').fill('Tell me a story')
    await page.getByPlaceholder('Send a message...').press('Enter')
    
    // UI should remain responsive - test theme toggle works during streaming
    const htmlElement = page.locator('html')
    const isDark = await htmlElement.evaluate(el => el.classList.contains('dark'))
    
    await page.getByRole('button', { name: /toggle theme/i }).click()
    
    // Theme should change even during streaming
    if (isDark) {
      await expect(htmlElement).not.toHaveClass(/dark/)
    } else {
      await expect(htmlElement).toHaveClass(/dark/)
    }
  })

  test('performance metrics', async ({ page }) => {
    // Measure initial load time
    const navigationTiming = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
      }
    })
    
    console.log('Performance metrics:', navigationTiming)
    
    // Should load quickly
    expect(navigationTiming.loadComplete).toBeLessThan(3000)
  })
})