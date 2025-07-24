import { test } from '@playwright/test'

test('debug app loading', async ({ page }) => {
  const errors: string[] = []
  
  // Set up console listener BEFORE navigation
  page.on('console', async msg => {
    const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => 'Complex object')))
    console.log(`Console [${msg.type()}]:`, msg.text(), args.length > 0 ? args : '')
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  // Also capture page errors
  page.on('pageerror', error => {
    console.log('Page error:', error.message)
    errors.push(error.message)
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
    console.log('App innerHTML length:', innerHTML.length)
    console.log('App innerHTML:', innerHTML)
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