import { Page } from '@playwright/test'

/**
 * Helper to take periodic screenshots during test execution
 */
export async function startPeriodicScreenshots(
  page: Page,
  testName: string,
  intervalMs: number = 1000
): Promise<() => void> {
  let screenshotIndex = 0
  let isRunning = true

  const captureScreenshot = async () => {
    if (!isRunning) return
    
    try {
      await page.screenshot({
        path: `./tmp/screenshots/periodic/${testName}-${screenshotIndex.toString().padStart(3, '0')}.png`,
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