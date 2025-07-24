import { test } from '@playwright/test'

test('debug app loading', async ({ page }) => {
  const errors: string[] = []
  
  // Capture errors
  page.on('console', async msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text())
      errors.push(msg.text())
    }
  })
  
  page.on('pageerror', error => {
    console.log('Page error:', error.message)
    errors.push(error.message)
  })
  
  await page.goto('http://localhost:5173/')
  await page.waitForTimeout(2000)
  
  // Take screenshot
  await page.screenshot({ path: 'tmp/screenshots/debug/app-state.png', fullPage: true })
  
  // Check app content
  const appContent = await page.locator('#app').textContent()
  console.log('App has content:', !!appContent)
  
  // Check for drawer
  const hasDrawer = await page.locator('[data-testid="mcp-drawer-toggle"]').count()
  console.log('Drawer toggle exists:', hasDrawer > 0)
  
  if (errors.length > 0) {
    console.log('\n=== ERRORS ===')
    errors.forEach(err => console.log(err))
  }
})