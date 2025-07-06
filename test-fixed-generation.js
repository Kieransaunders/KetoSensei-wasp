import { chromium } from 'playwright';

async function testFixedGeneration() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    console.log('Creating test user...');
    await page.goto('http://localhost:3002/signup');
    await page.waitForTimeout(2000);
    
    const username = 'fixtest' + Date.now();
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('Going to meal planning...');
    await page.goto('http://localhost:3002/meal-planning');
    await page.waitForTimeout(3000);
    
    console.log('Before clicking Auto-Generate:');
    const beforeContent = await page.locator('body').textContent();
    console.log('Has "No meal planned":', beforeContent.includes('No meal planned'));
    
    console.log('\n=== CLICKING AUTO-GENERATE ===');
    await page.click('button:has-text("Auto-Generate Next 7 Days")');
    await page.waitForTimeout(5000);
    
    console.log('\nAfter Auto-Generate:');
    const afterContent = await page.locator('body').textContent();
    console.log('Still has "No meal planned":', afterContent.includes('No meal planned'));
    console.log('Has success message:', afterContent.includes('planned and saved'));
    
    // Check for specific recipe names
    const mealNames = await page.locator('h4.font-medium').allTextContents();
    console.log('Found meal names:', mealNames);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'fixed-meal-planning.png', fullPage: true });
    console.log('Screenshot saved: fixed-meal-planning.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testFixedGeneration();