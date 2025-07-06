import { chromium } from 'playwright';

async function debugMealPlanning() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3002');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check if we need to login
    const loginForm = await page.locator('input[name="username"]').isVisible();
    console.log('Login form visible:', loginForm);
    
    if (loginForm) {
      console.log('Logging in...');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'testpass123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    console.log('Navigating to meal-planning...');
    await page.goto('http://localhost:3002/meal-planning');
    await page.waitForTimeout(5000);
    
    // Check page content
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    const bodyText = await page.locator('body').textContent();
    console.log('Body text length:', bodyText.length);
    console.log('First 500 chars:', bodyText.substring(0, 500));
    
    // Check for specific elements
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('H1 elements:', h1Elements);
    
    const errorElements = await page.locator('[class*="error"], .error, [class*="red"]').allTextContents();
    console.log('Error elements:', errorElements);
    
    // Take screenshot
    await page.screenshot({ path: 'meal-planning-debug.png', fullPage: true });
    console.log('Screenshot saved as meal-planning-debug.png');
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugMealPlanning();