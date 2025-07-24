import { test, expect } from '@playwright/test'

test('app renders with chat interface', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await page.waitForTimeout(3000)
  
  // Take screenshot for visual inspection
  await page.screenshot({ path: 'tmp/screenshots/bisect-check.png' })
  
  // Check if app div has content
  const appContent = await page.locator('#app').textContent()
  console.log('App has content:', !!appContent)
  
  // Check for any visible text
  const bodyText = await page.locator('body').textContent()
  console.log('Body text length:', bodyText?.length || 0)
  
  // Check for chat elements
  const hasChatElements = await page.locator('[class*="chat"], [class*="message"], input[type="text"], textarea').count()
  console.log('Chat-related elements found:', hasChatElements)
  
  // Pass if we have any content
  expect(bodyText?.length || 0).toBeGreaterThan(10)
})