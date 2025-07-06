import { expect } from '@playwright/test';

export class TestHelper {
  constructor(page) {
    this.page = page;
  }

  async login(username = 'testuser', password = 'testpass123') {
    // Navigate to login page
    await this.page.goto('/login');
    
    // Check if already logged in (redirect to dashboard)
    if (this.page.url().includes('/')) {
      return; // Already logged in
    }

    // Fill login form
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Wait for successful login (redirect to dashboard)
    await this.page.waitForURL('/');
  }

  async createTestUser(username = 'testuser', password = 'testpass123') {
    // Navigate to signup page
    await this.page.goto('/signup');
    
    // Fill signup form
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Wait for successful signup (redirect to dashboard)
    await this.page.waitForURL('/');
  }

  async logout() {
    // Look for logout button or menu
    const logoutButton = this.page.locator('text=Logout').or(this.page.locator('[data-testid="logout"]'));
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
    await this.page.waitForURL('/login');
  }

  async waitForDashboardToLoad() {
    // Wait for the dashboard to be fully loaded
    await this.page.waitForSelector('[data-testid="add-water-button"]', { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }

  async getWaterCount() {
    // Extract current water count from the UI using test ID
    const waterText = await this.page.textContent('[data-testid="water-count"]');
    const match = waterText.match(/(\d+)\/8 glasses/);
    return match ? parseInt(match[1]) : 0;
  }

  async clickAddWater() {
    await this.page.click('[data-testid="add-water-button"]');
    // Wait a bit for the action to complete
    await this.page.waitForTimeout(500);
  }

  async isWaterButtonDisabled() {
    return await this.page.isDisabled('[data-testid="add-water-button"]');
  }

  async getSenseiMessage() {
    // Look for the sensei message box using test ID
    const messageElement = this.page.locator('[data-testid="sensei-message-text"]');
    if (await messageElement.isVisible()) {
      return await messageElement.textContent();
    }
    return null;
  }
}

export async function setupTestEnvironment(page, browser) {
  // Create a fresh context for each test to isolate data
  const context = await browser.newContext();
  const testPage = await context.newPage();
  
  // Go to the app first to trigger any initial setup
  await testPage.goto('/');
  
  return { page: testPage, context, helper: new TestHelper(testPage) };
}
