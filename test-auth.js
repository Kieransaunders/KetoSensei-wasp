import { chromium } from 'playwright';

async function testAuthentication() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console logs and errors
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('FAILED REQUEST:', response.url(), response.status());
    }
  });
  
  try {
    console.log('1. Navigating to login...');
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(2000);
    
    console.log('2. Filling login form...');
    await page.fill('input[name="username"]', 'kieransaunders@me.com');
    await page.fill('input[name="password"]', 'your_password_here'); // You'll need to replace with actual password
    
    console.log('3. Submitting login...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check if login was successful
    const currentUrl = page.url();
    console.log('4. Current URL after login:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Login failed - still on login page');
      
      // Check for error messages
      const errorText = await page.locator('body').textContent();
      console.log('Page content:', errorText.substring(0, 500));
      
    } else {
      console.log('✅ Login successful - redirected to:', currentUrl);
      
      console.log('5. Navigating to meal-planning...');
      await page.goto('http://localhost:3002/meal-planning');
      await page.waitForTimeout(3000);
      
      const mealPlanningUrl = page.url();
      console.log('6. Meal planning URL:', mealPlanningUrl);
      
      if (mealPlanningUrl.includes('/meal-planning')) {
        console.log('✅ Successfully accessed meal-planning page');
        
        // Check page content
        const pageContent = await page.locator('body').textContent();
        console.log('Page content length:', pageContent.length);
        
        const hasLoadingText = pageContent.includes('Loading your meal planning dojo');
        const hasMealPlannerTitle = pageContent.includes('Meal Planner');
        
        console.log('Has loading text:', hasLoadingText);
        console.log('Has meal planner title:', hasMealPlannerTitle);
        
        // Wait a bit more for queries to load
        await page.waitForTimeout(5000);
        
        const finalContent = await page.locator('body').textContent();
        console.log('Final content includes "Auto-Generate":', finalContent.includes('Auto-Generate'));
        
      } else {
        console.log('❌ Redirected away from meal-planning to:', mealPlanningUrl);
      }
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testAuthentication();