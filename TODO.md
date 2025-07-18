# 🥋 KetoSensei – Product Development Roadmap

## 🧭 Product Vision

**KetoSensei** is an AI-powered keto lifestyle assistant that blends food planning, habit-building, and encouragement in a fun, dojo-themed interface. Users interact with a wise "Sensei" to receive recipes, track progress, and stay motivated — with Flowise-powered AI and a full-stack Wasp architecture behind the scenes.

## **App Concept & Identity**
- **Name:** KetoSensei
- **Tagline:** *"Discipline your cravings. Master your metabolism."*
- **Persona:** 'Keto Sensei' – a humorous, wise Kung-Fu master character who provides keto advice, encouragement, and metaphors from martial arts.

---

## ⚙️ Core Features

1. **AI Recipe Generator from Ingredients**
2. **Motivator Mode – "Sensei Speaks"**
3. **Mentor Memory System**
4. **Smart Meal Planning**
5. **Auto-Generated Shopping List**
6. **Streaks and Belt Progression**
7. **Weight Tracker + AI Insights**
8. **Ingredient Explorer**
9. **Favorites + Recipe Library**

---

## **High Priority Features**

### 🍽️ AI Recipe Generator
**User Story:** "I type 'avocado, salmon' and get 3 new recipes."
- [x] **Input Interface**: Ingredient input field with auto-complete
- [x] **Preference Integration**: Check user preferences before generating recipes  
- [x] **Recipe Display**: Show 3 recipe options with save functionality
- [x] **Context Awareness**: Consider user's dietary restrictions and allergies
- [x] **Database Storage**: Save generated recipes with proper schema
- [x] **Error Handling**: Comprehensive error handling and loading states
- [x] **Testing**: Unit tests for recipe generation functionality
- [ ] **Flowise Integration**: Connect to actual Claude via Flowise (currently using mock data)
- [ ] **Production Testing**: Test with real AI responses and refine prompts

### 💬 Motivator Mode – "Sensei Speaks"
**User Story:** "I get a daily wisdom quote based on my streak."
- [ ] **Daily Wisdom System**: Cron trigger for daily motivational messages
- [ ] **Streak-Based Content**: Context-aware messages based on user progress
- [ ] **Kung-Fu Integration**: Martial arts themed motivational content
- [ ] **Dashboard Display**: Prominent display of daily Sensei message

### 🧠 Mentor Memory System
**User Story:** "I say 'I don't like turkey', and the app remembers it."
- [ ] **Preference Extraction**: Claude extracts user preferences from conversations
- [ ] **Dynamic Preference Storage**: Save preferences to database automatically
- [ ] **Context Integration**: Use stored preferences in all future interactions
- [ ] **Preference Management**: UI to view and edit saved preferences

### 📅 Smart Meal Planning
**User Story:** "I generate a weekly plan that avoids my dislikes."
- [ ] **Weekly Plan Generator**: Button to generate full weekly meal plan
- [ ] **Preference Integration**: Fetch user preferences and allowed ingredients
- [ ] **Claude-Powered Planning**: Use AI to create balanced weekly plans
- [ ] **Plan Customization**: Allow users to modify generated plans

### 🛒 Auto-Generated Shopping List
**User Story:** "I convert my meal plan into a shopping list."
- [ ] **Ingredient Aggregation**: Collect all ingredients from meal plans
- [ ] **Smart Deduplication**: Combine duplicate ingredients with quantities
- [ ] **Organized Display**: Group ingredients by category (produce, dairy, etc.)
- [ ] **Shopping Mode**: Checkable list for grocery shopping

### 🧘‍♂️ Streaks & Belt Progression
**User Story:** "I just hit 7 days and earned my Blue Belt!"
- [ ] **Enhanced Streak System**: Improve existing streak tracking
- [ ] **Belt Logic**: Implement belt progression rules (White → Yellow → Orange → Green → Blue → Brown → Black)
- [ ] **Visual Belt Display**: Show current belt status prominently
- [ ] **Achievement Notifications**: Celebrate belt progression with animations
- [ ] **Habit Logging**: Multiple streak categories (meals, check-ins, goals)

### ⚖️ Weight Tracker + AI Insights
**User Story:** "Why didn't I lose weight this week?"
- [ ] **Weight Logging**: Simple weight input with date tracking
- [ ] **Progress Charts**: Visual representation of weight trends
- [ ] **AI Insights**: Claude-powered analysis of weight patterns
- [ ] **Contextual Advice**: Personalized suggestions based on weight trends
- [ ] **Goal Setting**: Weight loss targets with progress tracking

### 💡 Ingredient Explorer
**User Story:** "I tap on 'flaxseed' and get 3 recipe ideas."
- [ ] **Ingredient Grid**: Interactive grid of keto-friendly ingredients
- [ ] **Tap-to-Explore**: Generate recipes from individual ingredients
- [ ] **Preference Integration**: Filter suggestions based on user preferences
- [ ] **Recipe Uniqueness**: Avoid suggesting already-saved recipes
- [ ] **Ingredient Database**: Comprehensive keto ingredient library

---

## **Medium Priority Features**

### **Enhanced Recipe Library**
- [ ] **Meal Type Categorization**: Breakfast, Lunch, Dinner, Snacks, Wraps
- [ ] **KetoSensei-Approved Recipes**: Curated collection of short, practical, family-compatible recipes
- [x] **Favorites Functionality**: Fixed refresh issues and race conditions
- [x] **Enhanced Error Handling**: Added Sentry integration for favorites operations
- [x] **Performance Monitoring**: Added tracing for favorites operations
- [x] **Visual Feedback**: Added loading states and better UX for favorites
- [ ] **Enhanced Recipe Management**: Better organization and search functionality
- [ ] **Recipe Tagging**: Custom tags for better organization
- [ ] **Recipe Rating**: User rating system for saved recipes

### **Advanced Preference System**
- [ ] **Preference Editor UI**: Intuitive interface for managing likes/dislikes
- [ ] **Ingredient Allowlist**: Toggle ingredients as allowed/disallowed
- [ ] **Dynamic Memory**: AI learns preferences from user interactions
- [ ] **Preference Categories**: Organize by protein, vegetables, dairy, etc.
- [ ] **Allergy Management**: Comprehensive allergy tracking and avoidance

### **Challenges & Gamification**
- [ ] **7-Day Keto Kickstart**: Structured challenge for beginners
- [ ] **3-Day Reset Challenge**: For when people fall off track
- [ ] **Achievement System**: Unlock badges and rewards
- [ ] **Progress Visualization**: Charts and graphs for motivation

### **UI/UX Improvements**
- [ ] **Dojo Theme**: Consistent martial arts theming throughout
- [ ] **Responsive Design**: Enhanced mobile experience
- [ ] **Drag & Drop**: Meal planning with drag-and-drop interface
- [ ] **Animation System**: Smooth transitions and feedback animations

---

## **Low Priority Features**

### **Advanced Features**
- [ ] **Lightweight Macros Tracker**: Optional for advanced users – focus on net carbs
- [ ] **Social Features**: Share recipes and achievements with friends
- [ ] **Export Features**: Export meal plans and shopping lists to PDF
- [ ] **Meal Photo Recognition**: AI-powered food identification

---

## 🧱 Technical Architecture

### **Required Data Models** (Wasp/Prisma)
```
entity Preference {
  user: User,
  key: string,
  value: string
}

entity AllowedIngredient {
  user: User,
  name: string,
  allowed: boolean
}

entity WeightLog {
  user: User,
  date: Date,
  weight: float
}
```

### **Database Schema Updates**
- [ ] **Preference Model**: Store user likes/dislikes dynamically
- [ ] **AllowedIngredient Model**: Track ingredient preferences
- [ ] **WeightLog Model**: Store weight tracking data
- [ ] **Enhanced Streak Model**: Add belt color progression tracking
- [ ] **Enhanced Recipe Model**: Add tags and rating fields

### **Flowise Integration Map**
| Feature | Trigger | Flowise Flow |
|---------|---------|---------------|
| Generate Recipe | Ingredient input | Filter prefs + Claude recipe suggestion |
| Meal Plan | Button | Preferences + ingredients → Claude plan |
| Motivation | Cron | Streak + goal → Claude quote |
| Weight Insight | Weight log | Recent entries → Claude explanation |
| Ingredient Explorer | Ingredient tap | Preference injection → unique recipe list |

### **API Integration**
- [ ] **Enhanced Flowise Setup**: Configure Claude prompts for each feature
- [ ] **Memory System**: Store and retrieve user preferences in conversations
- [ ] **Cron Jobs**: Set up daily motivation triggers
- [ ] **Shopping List Generation**: Aggregate and deduplicate ingredients

### **UI Component Library**
- [ ] **Recipe Generator**: Ingredient input with AI-powered suggestions
- [ ] **Preference Editor**: Toggle-based ingredient management
- [ ] **Weight Tracker**: Chart visualization with insights
- [ ] **Ingredient Explorer**: Interactive grid with tap-to-generate
- [ ] **Daily Check-in**: Streak building with belt progression
- [ ] **Shopping List**: Organized, checkable grocery list

---

## ✅ Implementation Status

### **Current State**
- ✅ Basic user authentication
- ✅ Meal planning foundation
- ✅ Recipe library structure with working favorites functionality
- ✅ User preferences system (basic)
- ✅ Streak tracking infrastructure
- ✅ Error tracking and monitoring with Sentry
- ✅ Comprehensive test coverage for core features
- ✅ AI chat assistant (Flowise integration)
- ✅ Daily tips system

### **Recent Fixes (December 2024)**
- ✅ **Favorites Refresh Bug**: Fixed race conditions in recipe favorites functionality
- ✅ **Error Handling**: Enhanced error tracking with Sentry integration
- ✅ **Performance Monitoring**: Added custom spans for database operations
- ✅ **User Experience**: Added loading states and visual feedback for favorites
- ✅ **Testing Infrastructure**: Created comprehensive test suite for favorites functionality

### **Next Steps Priority Order**
1. **~~AI Recipe Generator~~**: ✅ **COMPLETED** - Core ingredient-to-recipe functionality with preference injection
2. **Enhanced Preference System**: Dynamic preference storage and management
3. **Weight Tracker**: Basic weight logging with AI insights
4. **Belt Progression**: Enhanced streak system with visual belt display
5. **Ingredient Explorer**: Interactive ingredient grid with recipe generation
6. **Shopping List Generator**: Automated shopping list from meal plans
7. **UI/UX Improvements**: Consistent dojo theming and enhanced mobile experience

### **Technical Implementation Strategy**
- **Phase 1**: Core AI features (Recipe Generator, Enhanced Preferences)
- **Phase 2**: Data tracking (Weight Tracker, Enhanced Streaks)
- **Phase 3**: User experience (Ingredient Explorer, Shopping Lists)
- **Phase 4**: Polish and optimization (UI/UX, Performance)

### **Backend Architecture**
- **Wasp**: React + Prisma + Node.js foundation
- **Flowise**: Modular AI flow orchestration
- **Claude/OpenRouter**: LLM processing
- **Sentry**: Error tracking and performance monitoring
- **TailwindCSS**: Utility-first styling

### **Quality Assurance**
- ✅ **Error Tracking**: Real-time error monitoring with context and stack traces
- ✅ **Performance Monitoring**: Database operation timing and UI interaction tracking
- ✅ **User Experience**: Loading states, error recovery, and visual feedback
- ✅ **Test Coverage**: Unit tests for favorites functionality with edge case handling
- ✅ **Playwright MCP**: Installed for end-to-end testing and app automation
- ✅ **Sentry MCP**: Installed for advanced error log analysis and monitoring
- ✅ **Recipe Generator Testing**: Unit tests for recipe generation functionality
- [ ] **Integration Tests**: End-to-end testing for critical user flows using Playwright MCP
- [ ] **Performance Testing**: Load testing for AI-powered operations
- [ ] **User Acceptance Testing**: Test all user stories and workflows with Playwright automation
- [ ] **Error Analysis**: Use Sentry MCP to analyze error patterns and troubleshoot issues

## 🧪 Testing Strategy & Implementation

### **Current Testing Infrastructure**

#### **Unit Testing** (Vitest + React Testing Library)
- ✅ **Setup**: Configured with jsdom environment and global test utilities
- ✅ **Location**: Tests in `src/tests/` directory  
- ✅ **Coverage**: Recipe generation, favorites functionality, error scenarios
- ✅ **Commands**: `npm test` for single run, `npm run test:watch` for watch mode

#### **End-to-End Testing** (Playwright)
- ✅ **Configuration**: `playwright.config.js` with proper browser settings
- ✅ **Commands**: `npm run test:e2e` for headless, `npm run test:e2e:ui` for UI mode
- ✅ **Playwright MCP**: Available for automated testing via Claude Code
- [ ] **Test Suites**: Need comprehensive E2E tests for user workflows

#### **Error Monitoring** (Sentry)
- ✅ **Integration**: Real-time error tracking and performance monitoring
- ✅ **Sentry MCP**: Available for error analysis and troubleshooting
- ✅ **Custom Spans**: Database operations and UI interactions tracked
- [ ] **Error Pattern Analysis**: Regular review of error trends and fixes

### **Testing Priorities**

#### **High Priority Tests Needed**
1. **AI Recipe Generator E2E Flow**:
   - User login → navigation → ingredient input → recipe generation → save to favorites
   - Test preference injection and dietary restriction compliance
   - Test error handling for API failures and invalid inputs

2. **Critical User Journeys**:
   - Complete onboarding flow (signup → preferences → first recipe)
   - Meal planning workflow (create plan → add meals → view plan)
   - Recipe management (view library → filter → favorite/unfavorite)

3. **Mobile Responsiveness**:
   - Navigation menu functionality on mobile devices
   - Recipe generator usability on small screens
   - Touch interactions and mobile-specific UI elements

#### **Development Testing Issues Discovered**

##### **Port Incrementing Problem** 🔧
- **Issue**: Development server port keeps incrementing (3000 → 3001 → 3002)
- **Root Cause**: Using incorrect start command or Wasp not in PATH
- **Solution**: Use `npm run dev` (not `npm start` or direct wasp commands)
- **Prevention**: Document correct development workflow

##### **Missing Routes/Navigation** 🔧  
- **Issue**: New routes don't appear after adding to main.wasp
- **Root Cause**: Wasp server not restarted after configuration changes
- **Solution**: Always restart dev server after modifying main.wasp
- **Testing**: Use Playwright MCP to verify route accessibility

##### **Component Import Issues** 🔧
- **Issue**: Route components not found or improperly imported
- **Root Cause**: Incorrect import paths or component naming
- **Solution**: Verify component exports and import paths match exactly
- **Testing**: Add build verification tests to catch import errors

### **Testing Protocols**

#### **Pre-Deployment Testing Checklist**
- [ ] All unit tests passing (`npm test`)
- [ ] E2E tests covering critical user flows (`npm run test:e2e`)
- [ ] Manual testing on mobile and desktop browsers
- [ ] Error monitoring setup verified (Sentry integration working)
- [ ] Performance benchmarks within acceptable ranges
- [ ] Database migration testing in staging environment

#### **Continuous Testing Strategy**
1. **Unit Tests**: Run automatically on every code change (watch mode)
2. **Integration Tests**: Run on every pull request using Playwright MCP
3. **Error Monitoring**: Continuous tracking with Sentry MCP analysis
4. **Performance Tests**: Weekly automated tests for AI operations
5. **User Acceptance Tests**: Monthly comprehensive testing of all features

#### **Testing Tools Integration**
- **Playwright MCP**: Use Claude Code to create and maintain E2E tests
- **Sentry MCP**: Regular error analysis and performance optimization
- **Vitest**: Fast unit testing with hot module reload
- **React Testing Library**: Component testing with user-focused assertions

#### **Test Data Management**
- **Development**: Use mock data for AI responses during development
- **Testing**: Separate test database with known fixture data
- **Staging**: Production-like data for realistic testing scenarios
- **Production**: Real-time monitoring and error tracking only
