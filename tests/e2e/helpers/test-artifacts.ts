import { test as base, expect } from '@playwright/test'
import { mkdirSync } from 'fs'
import { join } from 'path'

/**
 * Get the category for a test based on its file path
 */
function getTestCategory(testInfo: any): string {
  const file = testInfo.file || ''
  if (file.includes('ui-enhancement')) return 'enhanced-ui'
  if (file.includes('visual-regression')) return 'visual-regression'
  if (file.includes('iteration')) return 'iteration-tests'
  return 'chat-interface'
}

/**
 * Extended test with automatic screenshot/video path configuration
 */
export const test = base.extend({
  // Override the context to set up video recording
  context: async ({ browser }, use, testInfo) => {
    const category = getTestCategory(testInfo)
    const timestamp = new Date().toISOString()
    const videoDir = `./tmp/screenshots/${category}/videos`
    
    // Ensure directory exists
    mkdirSync(videoDir, { recursive: true })
    
    const context = await browser.newContext({
      recordVideo: {
        dir: videoDir,
        size: { width: 1280, height: 720 }
      }
    })
    
    await use(context)
    
    // Save video with timestamp
    const video = await context.pages()[0]?.video()
    if (video) {
      const videoPath = await video.path()
      if (videoPath) {
        const newPath = join(videoDir, `${timestamp}_${testInfo.title.replace(/\s+/g, '-')}.webm`)
        await video.saveAs(newPath)
      }
    }
    
    await context.close()
  }
})

/**
 * Helper to get screenshot path with timestamp
 */
export function getScreenshotPath(category: string, name: string): string {
  const timestamp = new Date().toISOString()
  const dir = `./tmp/screenshots/${category}/images`
  mkdirSync(dir, { recursive: true })
  return join(dir, `${timestamp}_${name}.png`)
}

/**
 * Take a screenshot with proper categorization and timestamp
 */
export async function takeScreenshot(page: any, category: string, name: string, options = {}) {
  const path = getScreenshotPath(category, name)
  await page.screenshot({ path, fullPage: true, ...options })
  return path
}