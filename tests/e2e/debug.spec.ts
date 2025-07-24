import { test } from '@playwright/test'

test('debug app loading', async ({ page }) => {
  const errors: string[] = []
  
  // Set up console listener BEFORE navigation
  page.on('console', msg => {
    console.log(`Console [${msg.type()}]:`, msg.text())
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  // Navigate to the app
  await page.goto('http://localhost:5173/')
  
  // Wait a bit for any errors to appear
  await page.waitForTimeout(2000)
  
  // Take a screenshot
  await page.screenshot({ path: 'tmp/screenshots/debug/app-state.png', fullPage: true })
  
  // Check if the app div exists
  const appDiv = await page.$('#app')
  console.log('App div exists:', !!appDiv)
  
  // Get inner HTML to see what's rendered
  if (appDiv) {
    const innerHTML = await appDiv.innerHTML()
    console.log('App innerHTML:', innerHTML.substring(0, 200) + '...')
  }
  
  // Check for specific elements
  const hasDrawerToggle = await page.locator('[data-testid="mcp-drawer-toggle"]').count()
  console.log('Drawer toggle exists:', hasDrawerToggle > 0)
  
  // Log all collected errors
  if (errors.length > 0) {
    console.log('\n=== ERRORS FOUND ===')
    errors.forEach(err => console.log(err))
  }
})