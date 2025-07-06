import { test, expect } from '@playwright/test';
import { TestHelper, setupTestEnvironment } from './test-helper.js';

test.describe('Water Intake Feature', () => {
  let helper;
  let testPage;
  let context;

  test.beforeEach(async ({ browser }) => {
    // Set up fresh test environment for each test
    const setup = await setupTestEnvironment(null, browser);
    testPage = setup.page;
    context = setup.context;
    helper = setup.helper;
  });

  test.afterEach(async () => {
    // Clean up after each test
    await context.close();
  });

  test('should display initial water intake as 0/8 glasses', async () => {
    // Try to create user first, then login
    try {
      await helper.createTestUser('watertest1', 'testpass123');
    } catch (e) {
      // User might already exist, try logging in
      await helper.login('watertest1', 'testpass123');
    }

    await helper.waitForDashboardToLoad();

    // Check initial water count
    const waterText = await testPage.textContent('[data-testid="water-count"]');
    expect(waterText).toContain('0/8 glasses');
  });

  test('should increment water count when add water button is clicked', async () => {
    // Create/login user
    try {
      await helper.createTestUser('watertest2', 'testpass123');
    } catch (e) {
      await helper.login('watertest2', 'testpass123');
    }

    await helper.waitForDashboardToLoad();

    // Get initial count
    const initialCount = await helper.getWaterCount();
    expect(initialCount).toBe(0);

    // Click add water button
    await helper.clickAddWater();

    // Wait for update and check new count
    await testPage.waitForTimeout(1000);
    const newCount = await helper.getWaterCount();
    expect(newCount).toBe(1);

    // Check button text is still "Add Water"
    const buttonText = await testPage.textContent('[data-testid="add-water-button"]');
    expect(buttonText).toContain('Add Water');
  });

  test('should show sensei message when water is added', async () => {
    try {
      await helper.createTestUser('watertest3', 'testpass123');
    } catch (e) {
      await helper.login('watertest3', 'testpass123');
    }

    await helper.waitForDashboardToLoad();

    // Click add water button
    await helper.clickAddWater();

    // Wait for sensei message to appear
    await testPage.waitForTimeout(1000);
    
    // Check for sensei message
    const senseiMessage = await helper.getSenseiMessage();
    expect(senseiMessage).toBeTruthy();
    expect(senseiMessage.toLowerCase()).toContain('hydration');
  });

  test('should allow adding multiple glasses of water', async () => {
    try {
      await helper.createTestUser('watertest4', 'testpass123');
    } catch (e) {
      await helper.login('watertest4', 'testpass123');
    }

    await helper.waitForDashboardToLoad();

    // Add multiple glasses
    for (let i = 1; i <= 5; i++) {
      await helper.clickAddWater();
      await testPage.waitForTimeout(500);
      
      const currentCount = await helper.getWaterCount();
      expect(currentCount).toBe(i);
    }

    // Button should still be enabled
    const isDisabled = await helper.isWaterButtonDisabled();
    expect(isDisabled).toBe(false);
  });

  test('should disable button and show "Goal Reached!" when 8 glasses reached', async () => {
    try {
      await helper.createTestUser('watertest5', 'testpass123');
    } catch (e) {
      await helper.login('watertest5', 'testpass123');
    }

    await helper.waitForDashboardToLoad();

    // Add 8 glasses of water
    for (let i = 1; i <= 8; i++) {
      await helper.clickAddWater();
      await testPage.waitForTimeout(500);
    }

    // Check final count
    const finalCount = await helper.getWaterCount();
    expect(finalCount).toBe(8);

    // Button should be disabled
    const isDisabled = await helper.isWaterButtonDisabled();
    expect(isDisabled).toBe(true);

    // Button text should show "Goal Reached!"
    const buttonText = await testPage.textContent('[data-testid="add-water-button"]');
    expect(buttonText).toContain('Goal Reached!');
  });

  test('should show special sensei message when goal is reached', async () => {
    try {
      await helper.createTestUser('watertest6', 'testpass123');
    } catch (e) {
      await helper.login('watertest6', 'testpass123');
    }

    await helper.waitForDashboardToLoad();

    // Add 7 glasses first
    for (let i = 1; i <= 7; i++) {
      await helper.clickAddWater();
      await testPage.waitForTimeout(300);
    }

    // Add the 8th glass
    await helper.clickAddWater();
    await testPage.waitForTimeout(1000);

    // Check for special completion message
    const senseiMessage = await helper.getSenseiMessage();
    expect(senseiMessage).toBeTruthy();
    expect(senseiMessage.toLowerCase()).toContain('outstanding');
    expect(senseiMessage.toLowerCase()).toContain('perfect');
  });

  test('should persist water count across page refreshes', async () => {
    try {
      await helper.createTestUser('watertest7', 'testpass123');
    } catch (e) {
      await helper.login('watertest7', 'testpass123');
    }

    await helper.waitForDashboardToLoad();

    // Add 3 glasses
    for (let i = 1; i <= 3; i++) {
      await helper.clickAddWater();
      await testPage.waitForTimeout(500);
    }

    const countBeforeRefresh = await helper.getWaterCount();
    expect(countBeforeRefresh).toBe(3);

    // Refresh the page
    await testPage.reload();
    await helper.waitForDashboardToLoad();

    // Count should persist
    const countAfterRefresh = await helper.getWaterCount();
    expect(countAfterRefresh).toBe(3);
  });

  test('should not allow adding more than 8 glasses', async () => {
    try {
      await helper.createTestUser('watertest8', 'testpass123');
    } catch (e) {
      await helper.login('watertest8', 'testpass123');
    }

    await helper.waitForDashboardToLoad();

    // Add 8 glasses
    for (let i = 1; i <= 8; i++) {
      await helper.clickAddWater();
      await testPage.waitForTimeout(300);
    }

    // Try to add one more (should be disabled)
    const isDisabled = await helper.isWaterButtonDisabled();
    expect(isDisabled).toBe(true);

    // Count should remain 8
    const finalCount = await helper.getWaterCount();
    expect(finalCount).toBe(8);
  });
});
