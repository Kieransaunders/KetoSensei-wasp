# 🧪 KetoSensei Testing Guide

## Quick Start Testing

### **Start Development Server**
```bash
# CORRECT way to start the server
cd "KetoSensei-wasp"
npm run dev

# Server should start on http://localhost:3000
# If port increments (3001, 3002, etc.), see troubleshooting below
```

### **Run Tests**
```bash
# Unit tests
npm test                    # Single run
npm run test:watch         # Watch mode (recommended for development)

# End-to-End tests  
npm run test:e2e           # Headless mode
npm run test:e2e:ui        # Interactive UI mode
```

## Testing Infrastructure

### **Unit Testing** (Vitest + React Testing Library)
- **Location**: `src/tests/`
- **Framework**: Vitest with jsdom environment
- **Assertions**: React Testing Library for user-focused testing
- **Coverage**: Recipe generation, favorites, error handling

**Example Test Structure**:
```javascript
// src/tests/RecipeGenerator.test.jsx
describe('RecipeGenerator', () => {
  it('generates recipes successfully', async () => {
    // Test implementation
  });
});
```

### **End-to-End Testing** (Playwright)
- **Config**: `playwright.config.js`
- **Browsers**: Chromium, Firefox, Safari (configurable)
- **Features**: Screenshots, video recording, trace collection

**Example E2E Test**:
```javascript
// tests/recipe-generator.spec.js
test('complete recipe generation flow', async ({ page }) => {
  await page.goto('/generate-recipes');
  await page.fill('[placeholder*="ingredients"]', 'salmon, avocado');
  await page.click('text=Generate Recipes');
  await expect(page.locator('text=Your Keto Creations')).toBeVisible();
});
```

## Testing Protocols

### **Feature Testing Checklist**

#### **Recipe Generator Testing**
- [ ] **Navigation Access**: Link visible in both desktop and mobile navigation
- [ ] **Input Validation**: Error handling for empty/invalid inputs
- [ ] **Recipe Generation**: Mock recipes display correctly with all metadata
- [ ] **Favorites Integration**: Can save/unsave generated recipes
- [ ] **Preference Injection**: User dietary restrictions properly applied
- [ ] **Loading States**: Proper loading indicators during generation
- [ ] **Error Handling**: Graceful failure with user-friendly messages

#### **Authentication Flow Testing**
- [ ] **Signup Process**: New user registration works correctly
- [ ] **Login Process**: Existing user authentication
- [ ] **Route Protection**: Unauthenticated users redirected to login
- [ ] **Navigation Visibility**: Menu only shows when logged in

#### **Core Functionality Testing**
- [ ] **Dashboard**: All widgets load and display data correctly
- [ ] **Meal Planning**: Can create and view meal plans
- [ ] **Recipe Library**: Can view, filter, and favorite recipes
- [ ] **User Preferences**: Can update dietary preferences and restrictions
- [ ] **Ask Sensei**: AI chat functionality works properly

### **Browser Compatibility Testing**
Test on multiple browsers and devices:
- [ ] **Chrome** (Desktop & Mobile)
- [ ] **Firefox** (Desktop)
- [ ] **Safari** (Desktop & Mobile)
- [ ] **Edge** (Desktop)

### **Responsive Design Testing**
- [ ] **Mobile** (< 768px): Hamburger menu, touch interactions
- [ ] **Tablet** (768px - 1024px): Layout adapts properly
- [ ] **Desktop** (> 1024px): Full navigation visible, optimal layout

## Troubleshooting Common Issues

### **Port Incrementing Problem** 🔧

**Symptoms**: 
- Development server starts on port 3001, 3002, 3003, etc.
- "Recipe Generator" link missing from navigation

**Root Cause**: 
- Using wrong start command
- Wasp not properly installed
- Previous processes still running

**Solutions**:
```bash
# 1. Use correct start command
npm run dev  # NOT: npm start, wasp start (unless wasp in PATH)

# 2. Kill existing processes
pkill -f node    # Kills ALL Node processes (be careful)
pkill -f wasp    # More specific to Wasp

# 3. Clean restart
wasp clean       # If wasp command available
npm run dev

# 4. Check what's using ports
lsof -i :3000-3010
```

### **Missing Routes/Navigation** 🔧

**Symptoms**:
- New routes return 404 errors
- Navigation links missing
- "No routes matched" console errors

**Root Cause**: 
- Wasp server not restarted after `main.wasp` changes
- Import path errors in component definitions

**Solutions**:
```bash
# 1. Always restart after main.wasp changes
# Stop server (Ctrl+C) then:
npm run dev

# 2. Verify route configuration in main.wasp
# 3. Check component import paths are correct
```

### **Test Failures** 🔧

**Common Issues**:
- Mock functions not properly reset between tests
- Async operations not properly awaited
- DOM elements not found (timing issues)

**Solutions**:
```javascript
// Reset mocks in beforeEach
beforeEach(() => {
  vi.clearAllMocks();
});

// Proper async/await usage
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});

// Better element queries
screen.getByRole('button', { name: /generate recipes/i })
```

## Playwright MCP Integration

### **Using Claude Code for E2E Testing**

The project has Playwright MCP installed, allowing Claude Code to:

1. **Create Tests**: Generate Playwright tests for specific user workflows
2. **Run Tests**: Execute tests and analyze results
3. **Debug Issues**: Investigate test failures with screenshots and traces
4. **Maintain Tests**: Update tests when UI changes

**Example Claude Code Usage**:
```
"Create a Playwright test that verifies the complete recipe generation workflow:
1. Login as a test user
2. Navigate to recipe generator
3. Enter ingredients: 'chicken, broccoli, cheese'
4. Generate recipes
5. Save first recipe to favorites
6. Verify recipe appears in recipe library"
```

### **Sentry MCP Integration**

Use Sentry MCP for error monitoring and analysis:

1. **Error Investigation**: Analyze production errors and stack traces
2. **Performance Monitoring**: Track slow database operations
3. **User Impact Analysis**: Understand how errors affect user experience
4. **Trend Analysis**: Identify patterns in error occurrence

**Example Sentry MCP Usage**:
```
"Analyze recent errors in the ketosensei project related to recipe generation.
Show me the most frequent errors and their impact on users."
```

## Continuous Testing Strategy

### **Development Workflow**
1. **Write Tests First**: TDD approach for new features
2. **Run Tests Locally**: Before committing changes
3. **Monitor Test Results**: Fix failures immediately
4. **Update Tests**: When requirements change

### **Pre-Deployment Checklist**
- [ ] All unit tests passing
- [ ] Critical E2E tests passing
- [ ] Manual testing on multiple browsers
- [ ] Error monitoring verified
- [ ] Performance benchmarks met

### **Regular Testing Schedule**
- **Daily**: Unit tests in watch mode during development
- **Weekly**: Full E2E test suite execution
- **Monthly**: Comprehensive browser compatibility testing
- **Quarterly**: Performance and load testing review