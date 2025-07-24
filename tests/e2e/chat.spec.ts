import { test, expect } from '@playwright/test'

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads the chat interface', async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole('heading', { name: 'AI Chat Agent' })).toBeVisible()
    
    // Check for input area
    await expect(page.getByPlaceholder('Send a message...')).toBeVisible()
    
    // Check for theme toggle
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible()
  })

  test('shows welcome message when no messages', async ({ page }) => {
    // Note: OpenAI key warning may be visible
    await expect(page.getByText('Welcome to AI Chat')).toBeVisible()
    await expect(page.getByText('Start a conversation with your AI assistant')).toBeVisible()
  })

  test('can toggle theme', async ({ page }) => {
    const htmlElement = page.locator('html')
    
    // Check initial state (should be dark by default)
    await expect(htmlElement).toHaveClass(/dark/)
    
    // Toggle to light
    await page.getByRole('button', { name: /toggle theme/i }).click()
    await expect(htmlElement).not.toHaveClass(/dark/)
    await expect(htmlElement).toHaveClass(/light/)
    
    // Toggle back to dark
    await page.getByRole('button', { name: /toggle theme/i }).click()
    await expect(htmlElement).toHaveClass(/dark/)
  })

  test('can toggle debug mode', async ({ page }) => {
    // Debug should be off initially
    await expect(page.locator('pre').first()).not.toBeVisible()
    
    // Toggle debug on
    await page.getByLabel('Toggle debug mode').click()
    
    // Send a message to generate debug output
    const input = page.getByPlaceholder('Send a message...')
    await input.fill('Hello')
    await input.press('Enter')
    
    // Check for debug output
    await expect(page.locator('pre').first()).toBeVisible()
  })

  test('can send a message', async ({ page }) => {
    const input = page.getByPlaceholder('Send a message...')
    const testMessage = 'Hello, AI!'
    
    await input.fill(testMessage)
    await input.press('Enter')
    
    // Message should appear in chat
    await expect(page.getByText(testMessage)).toBeVisible()
    
    // Input should be cleared
    await expect(input).toHaveValue('')
    
    // Should show loading state
    await expect(page.getByRole('button', { name: 'Stop generation' })).toBeVisible()
  })

  test('auto-resizes textarea', async ({ page }) => {
    const textarea = page.getByPlaceholder('Send a message...')
    
    // Get initial height
    const initialHeight = await textarea.evaluate(el => el.scrollHeight)
    
    // Type multiple lines
    await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4')
    
    // Height should increase
    const newHeight = await textarea.evaluate(el => el.scrollHeight)
    expect(newHeight).toBeGreaterThan(initialHeight)
  })

  test('can clear chat history', async ({ page }) => {
    // Send a message
    await page.getByPlaceholder('Send a message...').fill('Test message')
    await page.getByPlaceholder('Send a message...').press('Enter')
    
    // Wait for message to appear
    await expect(page.getByText('Test message')).toBeVisible()
    
    // Clear history
    await page.getByRole('button', { name: /clear chat history/i }).click()
    
    // Welcome message should reappear
    await expect(page.getByText('Welcome to AI Chat')).toBeVisible()
    
    // Previous message should be gone
    await expect(page.getByText('Test message')).not.toBeVisible()
  })
})