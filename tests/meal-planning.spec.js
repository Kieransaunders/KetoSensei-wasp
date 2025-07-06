// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Meal Planning Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3002');
    
    // Handle login if needed
    await page.waitForSelector('input[name="username"], h1', { timeout: 10000 });
    
    // Check if we're on login page or already logged in
    const isLoginPage = await page.locator('input[name="username"]').isVisible();
    
    if (isLoginPage) {
      // Create/login with test account
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'testpass123');
      
      // Try login first
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // If login fails, go to signup
      const stillOnLogin = await page.locator('input[name="username"]').isVisible();
      if (stillOnLogin) {
        // Navigate to signup
        await page.click('a[href="/signup"]');
        await page.waitForSelector('input[name="username"]');
        
        // Fill signup form
        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'testpass123');
        await page.click('button[type="submit"]');
        
        // Wait for successful signup/login
        await page.waitForSelector('h1', { timeout: 10000 });
      }
    }
  });

  test('should load meal planning page', async ({ page }) => {
    // Navigate to meal planning page
    await page.goto('http://localhost:3002/meal-planning');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check for page title or key elements
    const pageTitle = await page.locator('h1').textContent();
    console.log('Page title:', pageTitle);
    
    // Check for loading state
    const loadingText = await page.locator('text=Loading your meal planning dojo').isVisible();
    console.log('Loading state visible:', loadingText);
    
    // Check for error messages
    const errorMessages = await page.locator('[class*="red"], [class*="error"]').allTextContents();
    console.log('Error messages:', errorMessages);
    
    // Check for main page elements
    const mainElements = await page.locator('button, div, h1, h2, h3').allTextContents();
    console.log('Main elements on page:', mainElements.slice(0, 10)); // First 10 elements
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'meal-planning-debug.png', fullPage: true });
    
    // Expect the page to not be blank
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('should check for JavaScript errors', async ({ page }) => {
    const errors = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Navigate to meal planning page
    await page.goto('http://localhost:3002/meal-planning');
    await page.waitForTimeout(5000);
    
    // Log any errors found
    console.log('JavaScript errors found:', errors);
    
    // Check if there are any blocking errors
    const hasBlockingErrors = errors.some(error => 
      error.includes('Cannot read') || 
      error.includes('undefined') || 
      error.includes('null')
    );
    
    if (hasBlockingErrors) {
      console.log('Blocking errors detected that might prevent page from working');
    }
  });

  test('should check network requests', async ({ page }) => {
    const failedRequests = [];
    
    // Listen for failed requests
    page.on('response', response => {
      if (!response.ok()) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Navigate to meal planning page
    await page.goto('http://localhost:3002/meal-planning');
    await page.waitForTimeout(5000);
    
    // Log failed requests
    console.log('Failed network requests:', failedRequests);
    
    // Check for API endpoint failures
    const apiFailures = failedRequests.filter(req => 
      req.url.includes('/api/') || req.url.includes('query')
    );
    
    if (apiFailures.length > 0) {
      console.log('API failures detected:', apiFailures);
    }
  });
});