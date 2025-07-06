import { chromium } from 'playwright';

async function testMealGeneration() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    console.log('1. Creating new test user...');
    await page.goto('http://localhost:3002/signup');
    await page.waitForTimeout(2000);
    
    const username = 'mealtest' + Date.now();
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('2. Navigating to meal planning...');
    await page.goto('http://localhost:3002/meal-planning');
    await page.waitForTimeout(3000);
    
    console.log('3. Checking initial state...');
    const beforeGenerate = await page.locator('body').textContent();
    console.log('Has "No meal planned":', beforeGenerate.includes('No meal planned'));
    console.log('Has meal slots:', beforeGenerate.includes('Breakfast') && beforeGenerate.includes('Lunch'));
    
    console.log('4. Testing Auto-Generate button...');
    const generateButton = page.locator('button:has-text("Auto-Generate Next 7 Days")');
    const buttonVisible = await generateButton.isVisible();
    console.log('Auto-Generate button visible:', buttonVisible);
    
    if (buttonVisible) {
      await generateButton.click();
      console.log('Clicked Auto-Generate button');
      
      // Wait for generation to complete
      await page.waitForTimeout(5000);
      
      console.log('5. Checking results...');
      const afterGenerate = await page.locator('body').textContent();
      console.log('Success message visible:', afterGenerate.includes('planned and saved'));
      console.log('Still has "No meal planned":', afterGenerate.includes('No meal planned'));
      
      // Check if actual meal names appear
      const mealElements = await page.locator('h4[class*="font-medium"]').allTextContents();
      console.log('Meal names found:', mealElements);
      
      // Take screenshot after generation
      await page.screenshot({ path: 'meal-planning-after-generate.png', fullPage: true });
      console.log('Screenshot saved: meal-planning-after-generate.png');
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testMealGeneration();