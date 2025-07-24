import { test, expect } from '@playwright/test'
import { Page } from '@playwright/test'
import { mkdirSync } from 'fs'
import { join } from 'path'

/**
 * Test suite for the grid-based drawer mechanism
 * Verifies that the drawer uses CSS Grid properly without visual overlap
 */
test.describe('Grid-Based Drawer Mechanism', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.waitForSelector('[data-testid="mcp-drawer-toggle"]', { timeout: 10000 })
    
    // Ensure consistent viewport size for measurements
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('comprehensive grid drawer layout verification', async ({ page }) => {
    // Create screenshots directory
    const screenshotDir = './tmp/screenshots'
    mkdirSync(screenshotDir, { recursive: true })
    
    // STEP 1: Take screenshot of initial state (drawer closed)
    await page.screenshot({ 
      path: join(screenshotDir, 'grid-drawer-closed.png'),
      fullPage: true 
    })
    console.log('📸 Saved initial state: grid-drawer-closed.png')
    
    // STEP 2: Measure initial layout
    const initialMeasurements = await measureLayout(page)
    console.log('📏 Initial measurements:', JSON.stringify(initialMeasurements, null, 2))
    
    // Verify initial state
    await expect(page.locator('[data-testid="mcp-drawer"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="mcp-drawer-toggle"]')).toHaveAttribute('aria-expanded', 'false')
    
    // STEP 3: Click the drawer handle to open it
    const drawerToggle = page.locator('[data-testid="mcp-drawer-toggle"]')
    await drawerToggle.click()
    
    // Wait for animation to complete
    await page.waitForTimeout(500)
    
    // STEP 4: Take screenshot of drawer open state
    await page.screenshot({ 
      path: join(screenshotDir, 'grid-drawer-open.png'),
      fullPage: true 
    })
    console.log('📸 Saved open state: grid-drawer-open.png')
    
    // STEP 5: Measure layout after opening
    const openMeasurements = await measureLayout(page)
    console.log('📏 Open measurements:', JSON.stringify(openMeasurements, null, 2))
    
    // Verify drawer is open
    await expect(page.locator('[data-testid="mcp-drawer"]')).toBeVisible()
    await expect(page.locator('[data-testid="mcp-drawer-toggle"]')).toHaveAttribute('aria-expanded', 'true')
    
    // STEP 6: Verify grid layout behavior
    await verifyGridLayout(page, initialMeasurements, openMeasurements)
    
    // STEP 7: Test closing the drawer
    await drawerToggle.click()
    await page.waitForTimeout(500)
    
    const closedMeasurements = await measureLayout(page)
    
    // Verify measurements return to initial state
    const chatWidthDiff = Math.abs(closedMeasurements.chatContainer.width - initialMeasurements.chatContainer.width)
    expect(chatWidthDiff).toBeLessThanOrEqual(5) // Allow 5px tolerance
    expect(closedMeasurements.appContainer.gridColumns).toBe(initialMeasurements.appContainer.gridColumns)
    
    console.log('✅ Grid drawer mechanism test completed successfully')
  })
})

/**
 * Measure key layout dimensions and properties
 */
async function measureLayout(page: Page) {
  return await page.evaluate(() => {
    const appContainer = document.querySelector('.app-container') as HTMLElement
    const chatContainer = document.querySelector('.chat-container') as HTMLElement
    const drawerContent = document.querySelector('.drawer-content') as HTMLElement
    const drawerToggle = document.querySelector('[data-testid="mcp-drawer-toggle"]') as HTMLElement
    
    const appRect = appContainer?.getBoundingClientRect()
    const chatRect = chatContainer?.getBoundingClientRect()
    const drawerRect = drawerContent?.getBoundingClientRect()
    const toggleRect = drawerToggle?.getBoundingClientRect()
    
    const appStyles = window.getComputedStyle(appContainer)
    const chatStyles = window.getComputedStyle(chatContainer)
    const drawerStyles = window.getComputedStyle(drawerContent)
    
    return {
      appContainer: {
        width: appRect?.width || 0,
        height: appRect?.height || 0,
        gridColumns: appStyles.gridTemplateColumns,
        gridAreas: appStyles.gridTemplateAreas,
        display: appStyles.display
      },
      chatContainer: {
        width: chatRect?.width || 0,
        height: chatRect?.height || 0,
        x: chatRect?.x || 0,
        y: chatRect?.y || 0,
        gridArea: chatStyles.gridArea,
        position: chatStyles.position
      },
      drawerContent: {
        width: drawerRect?.width || 0,
        height: drawerRect?.height || 0,
        x: drawerRect?.x || 0,
        y: drawerRect?.y || 0,
        visibility: drawerStyles.visibility,
        position: drawerStyles.position,
        gridArea: drawerStyles.gridArea
      },
      drawerToggle: {
        width: toggleRect?.width || 0,
        height: toggleRect?.height || 0,
        x: toggleRect?.x || 0,
        y: toggleRect?.y || 0,
        position: drawerStyles.position
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  })
}

/**
 * Verify the grid layout behaves correctly
 */
async function verifyGridLayout(page: Page, initial: any, open: any) {
  console.log('🔍 Verifying grid layout behavior...')
  
  // 1. Chat container should shrink when drawer opens
  expect(open.chatContainer.width).toBeLessThan(initial.chatContainer.width)
  console.log(`✅ Chat container shrunk: ${initial.chatContainer.width}px → ${open.chatContainer.width}px (${initial.chatContainer.width - open.chatContainer.width}px reduction)`)
  
  // 2. Grid template columns should change
  expect(open.appContainer.gridColumns).not.toBe(initial.appContainer.gridColumns)
  console.log(`✅ Grid columns changed: "${initial.appContainer.gridColumns}" → "${open.appContainer.gridColumns}"`)
  
  // 3. Drawer should appear as a proper column, not overlapping
  expect(open.drawerContent.width).toBeGreaterThan(0)
  expect(open.drawerContent.x).toBeGreaterThan(open.chatContainer.x + open.chatContainer.width - 10) // Allow 10px tolerance
  console.log(`✅ Drawer positioned as column: chat ends at ${open.chatContainer.x + open.chatContainer.width}px, drawer starts at ${open.drawerContent.x}px`)
  
  // 4. No visual overlap between chat and drawer
  const chatRight = open.chatContainer.x + open.chatContainer.width
  const drawerLeft = open.drawerContent.x
  const gap = drawerLeft - chatRight
  expect(gap).toBeGreaterThanOrEqual(-10) // Allow small negative for borders/margins
  console.log(`✅ No overlap detected: ${gap}px gap between chat and drawer`)
  
  // 5. Handle should be properly positioned relative to drawer
  const expectedHandleX = open.drawerContent.x - open.drawerToggle.width // Handle should be just left of drawer
  const handlePositionDiff = Math.abs(open.drawerToggle.x - expectedHandleX)
  expect(handlePositionDiff).toBeLessThanOrEqual(20) // Allow 20px tolerance for layout variations
  console.log(`✅ Handle properly positioned: expected ${expectedHandleX}px, actual ${open.drawerToggle.x}px (${handlePositionDiff}px difference)`)
  
  // 6. Verify the drawer takes expected width (380px as per CSS)
  const expectedWidth = 380
  const widthDiff = Math.abs(open.drawerContent.width - expectedWidth)
  expect(widthDiff).toBeLessThanOrEqual(20) // Allow 20px tolerance for padding
  console.log(`✅ Drawer has expected width: ${open.drawerContent.width}px (expected ~${expectedWidth}px, ${widthDiff}px difference)`)
  
  // 7. App container should use full viewport width
  const appWidthDiff = Math.abs(open.appContainer.width - open.viewport.width)
  expect(appWidthDiff).toBeLessThanOrEqual(5) // Allow 5px tolerance for browser variations
  console.log(`✅ App container uses full width: ${open.appContainer.width}px of ${open.viewport.width}px viewport (${appWidthDiff}px difference)`)
  
  console.log('🎉 All grid layout verifications passed!')
}