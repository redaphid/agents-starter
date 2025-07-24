const { chromium } = require('playwright');
const path = require('path');

async function captureComponentLab() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  
  const htmlPath = path.resolve(__dirname, 'component-lab.html');
  await page.goto(`file://${htmlPath}`);
  
  // Wait for content to load
  await page.waitForTimeout(1000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'design-progression/screenshots/component-lab-current.png',
    fullPage: true
  });
  
  await browser.close();
  console.log('Component lab screenshot saved!');
}

captureComponentLab().catch(console.error);