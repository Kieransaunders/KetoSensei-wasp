# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KetoSensei is a keto diet planning application built with Wasp, a React-based full-stack framework. The app provides meal planning, recipe management, user preferences, and streak tracking functionality.

## Core Architecture

### Wasp Framework Structure
- **main.wasp**: Central configuration file defining app structure, routes, pages, actions, and queries
- **schema.prisma**: Database schema with SQLite backend defining User, MealPlan, Meal, Recipe, UserPreferences, and Streak models
- **src/**: Contains all React components, server actions, and queries

### Key Components
- **Authentication**: Username/password auth with automatic redirects
- **Database**: Prisma ORM with SQLite, managed by Wasp
- **Frontend**: React with TypeScript support, TailwindCSS for styling
- **Error Tracking**: Sentry integration for monitoring
- **AI Integration**: Flowise chatbot for "Ask Sensei" feature
- **Testing**: Vitest with React Testing Library
- **Gamification**: Belt progression system and streak tracking

### Data Models
- **User**: Core user entity with relationships to all other models
- **MealPlan**: Weekly meal plans containing multiple meals
- **Meal**: Individual meals (breakfast, lunch, dinner) with associated recipes
- **Recipe**: User-created recipes with ingredients, instructions, and favorite status
- **UserPreferences**: Dietary preferences (vegetarian, dairy-free, allergies, protein source)
- **Streak**: Progress tracking for various user activities with belt progression system
- **DailyTip**: Daily wisdom content from "KetoSensei" persona

## Development Commands

Since this is a Wasp project, development commands are handled through the Wasp CLI:

```bash
# Start development server
wasp start

# Build for production
wasp build

# Database operations
wasp db migrate-dev    # Run database migrations
wasp db studio        # Open Prisma Studio for database management

# Generate Prisma client
wasp db generate

# Testing
npm test              # Run tests with Vitest
npm run test:watch    # Run tests in watch mode
```

## File Structure

```
src/
├── Layout.jsx          # Main app layout with navigation
├── Main.css           # Global styles
├── actions.js         # Server-side actions (mutations)
├── queries.js         # Server-side queries (data fetching)
├── vite-env.d.ts      # TypeScript declarations
├── tests/             # Test files (Vitest + React Testing Library)
└── pages/
    ├── Dashboard.jsx
    ├── MealPlanning.jsx
    ├── RecipeLibrary.jsx
    ├── UserPreferences.jsx
    ├── Sensei.jsx       # AI chatbot interface
    └── auth/
        ├── Login.jsx
        └── Signup.jsx
```

## Server Actions & Queries

### Actions (src/actions.js)
- `updateUserPreferences`: Update user dietary preferences
- `createMealPlan`: Create weekly meal plan with associated meals
- `addRecipeToFavorites`: Mark recipe as favorite
- `trackStreak`: Update user activity streaks

### Queries (src/queries.js)
- `getUserPreferences`: Fetch user dietary preferences
- `getMealPlans`: Get user's meal plans with meals included
- `getRecipes`: Fetch recipes with optional filtering by type/favorite status
- `getStreaks`: Get user's activity streaks
- `getTodaysTip`: Get daily wisdom from KetoSensei persona

## Authentication & Security

All pages except auth pages require authentication (`authRequired: true`). Server actions and queries include user authentication checks and proper error handling with HTTP status codes.

## Styling

- **TailwindCSS**: Primary styling framework
- **Responsive Design**: Mobile-first approach with container classes
- **Custom CSS**: Additional styles in Main.css for specific components

## Database Management

Database schema changes should be made in `schema.prisma` followed by running `wasp db migrate-dev`. The database uses SQLite with Prisma ORM for type-safe database operations.

## Error Handling

- Server actions use `HttpError` from 'wasp/server' for proper error responses
- Sentry integration for error tracking and monitoring
- Authentication errors automatically redirect to login page

## TypeScript Configuration

The project uses TypeScript with Wasp-specific configurations in `tsconfig.json`. The build process is handled by Wasp's internal tooling with Vite for bundling.

## App Theme & Persona

KetoSensei uses a "Kung Fu master" persona throughout the app:
- **Tagline**: "Discipline your cravings. Master your metabolism."
- **Design**: Dark theme with lime green accents, martial arts theming
- **Gamification**: Belt progression system (White → Yellow → Orange → Green → Blue → Brown → Black)
- **AI Chat**: Flowise-powered chatbot with humorous, wise responses
- **Daily Tips**: Motivational content with martial arts metaphors

## Development Architecture

### Key Dependencies
- **Wasp**: ^0.16.3 (Full-stack framework)
- **React**: ^18.2.0 with TypeScript support
- **Sentry**: ^9.35.0 (Error tracking)
- **Flowise**: ^3.0.3 (AI chatbot integration)
- **TailwindCSS**: ^3.2.7 (Styling)
- **Vitest**: Testing framework with jsdom environment

### Performance Monitoring
- Sentry integration for error tracking and performance monitoring
- Custom spans for database operations and UI interactions
- Real-time error tracking with stack traces and user context

### Testing Strategy
- **Unit Tests**: Vitest with React Testing Library
- **Test Setup**: jsdom environment with global test utilities
- **Coverage**: Focus on critical user flows and error scenarios
- **Location**: Tests in `src/tests/` directory