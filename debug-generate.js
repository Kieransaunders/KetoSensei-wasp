import { chromium } from 'playwright';

async function debugGenerate() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture all console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    // Use existing user if possible
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(2000);
    
    // Try with existing credentials first
    await page.fill('input[name="username"]', 'kieransaunders@me.com');
    await page.fill('input[name="password"]', 'yourpassword'); // You'll need the actual password
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // If login failed, create new user
    if (page.url().includes('/login')) {
      await page.goto('http://localhost:3002/signup');
      await page.waitForTimeout(1000);
      
      const username = 'debuguser' + Date.now();
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', 'testpass123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    await page.goto('http://localhost:3002/meal-planning');
    await page.waitForTimeout(3000);
    
    console.log('\n=== Clicking Auto-Generate ===');
    await page.click('button:has-text("Auto-Generate Next 7 Days")');
    
    // Wait for console output
    await page.waitForTimeout(8000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugGenerate();