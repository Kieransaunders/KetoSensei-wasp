import { chromium } from 'playwright';

async function simpleTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    console.log('Going to signup page...');
    await page.goto('http://localhost:3002/signup');
    await page.waitForTimeout(2000);
    
    // Create new test user
    const username = 'testuser' + Date.now();
    const password = 'testpass123';
    
    console.log('Creating user:', username);
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('After signup URL:', currentUrl);
    
    if (!currentUrl.includes('/signup') && !currentUrl.includes('/login')) {
      console.log('✅ Signup successful, now testing meal-planning...');
      
      await page.goto('http://localhost:3002/meal-planning');
      await page.waitForTimeout(5000);
      
      const mealPlanningContent = await page.locator('body').textContent();
      console.log('Meal planning page loaded successfully:', mealPlanningContent.includes('Meal Planner'));
      console.log('Has Auto-Generate button:', mealPlanningContent.includes('Auto-Generate'));
      console.log('Has loading message:', mealPlanningContent.includes('Loading your meal planning dojo'));
      
      // Take screenshot for verification
      await page.screenshot({ path: 'meal-planning-working.png', fullPage: true });
      
    } else {
      console.log('❌ Signup failed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

simpleTest();