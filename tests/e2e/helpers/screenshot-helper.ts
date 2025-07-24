import { Page } from '@playwright/test'
import { mkdirSync } from 'fs'
import { join } from 'path'

/**
 * Helper to take periodic screenshots during test execution
 */
export async function startPeriodicScreenshots(
  page: Page,
  category: string,
  testName: string,
  intervalMs: number = 1000
): Promise<() => void> {
  let screenshotIndex = 0
  let isRunning = true
  const startTime = new Date()

  const captureScreenshot = async () => {
    if (!isRunning) return
    
    try {
      const timestamp = new Date().toISOString()
      const dir = `./tmp/screenshots/${category}/images`
      mkdirSync(dir, { recursive: true })
      
      await page.screenshot({
        path: join(dir, `${timestamp}_${testName}-${screenshotIndex.toString().padStart(3, '0')}.png`),
        fullPage: true,
      })
      screenshotIndex++
    } catch (error) {
      // Ignore errors if page is closed or navigating
      console.log(`Screenshot failed: ${error}`)
    }
    
    if (isRunning) {
      setTimeout(captureScreenshot, intervalMs)
    }
  }

  // Start capturing
  setTimeout(captureScreenshot, 0)

  // Return stop function
  return () => {
    isRunning = false
  }
}

/**
 * Take a single screenshot with organized naming
 */
export async function takeScreenshot(
  page: Page,
  category: string,
  screenshotName: string
): Promise<void> {
  try {
    const dir = `./tmp/screenshots/${category}`
    mkdirSync(dir, { recursive: true })
    
    await page.screenshot({
      path: join(dir, `${screenshotName}.png`),
      fullPage: true,
    })
  } catch (error) {
    console.log(`Screenshot failed: ${error}`)
  }
}