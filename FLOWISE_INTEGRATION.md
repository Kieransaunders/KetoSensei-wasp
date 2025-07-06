# 🔌 Flowise Integration Guide

This guide explains how to connect KetoSensei with Flowise for AI-powered recipe generation.

## Quick Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Update Flowise settings** in `.env`:
   ```
   FLOWISE_API_URL="http://your-flowise-instance:3000"
   FLOWISE_API_KEY="your-api-key"
   FLOWISE_RECIPE_FLOW_ID="your-recipe-flow-id"
   ```

3. **Test the connection**:
   - Start the app with `wasp start`
   - Navigate to `/generate-recipes`
   - Try generating recipes with any ingredients

## Current Implementation Status

✅ **Ready for Testing**:
- Preference injection system
- User dietary restrictions handling
- Recipe generation UI
- Database storage for generated recipes
- Error handling and loading states

🔄 **Using Mock Data**:
- The system currently returns mock recipes
- Replace `getMockRecipes()` with actual Flowise calls
- All infrastructure is in place for real integration

## Flowise Flow Configuration

### Recipe Generation Flow

Your Flowise flow should:

1. **Accept Input**: 
   - `question`: The formatted prompt with ingredients and preferences
   - `sessionId`: User-specific session (format: `user_{userId}_recipes`)

2. **Process with Claude**:
   - Use the provided prompt that includes user dietary restrictions
   - Set temperature to 0.7 for creative but consistent recipes
   - Limit output to ~2000 tokens

3. **Return JSON**:
   ```json
   [
     {
       "title": "Recipe Name",
       "ingredients": ["ingredient1", "ingredient2"],
       "instructions": ["step1", "step2"],
       "prepTime": "15 minutes",
       "servings": 2,
       "netCarbs": "5g per serving"
     }
   ]
   ```

### Sample Flowise Node Configuration

```json
{
  "systemMessage": "You are KetoSensei, a wise martial arts master who creates keto recipes. Always respect user dietary restrictions and allergies.",
  "temperature": 0.7,
  "maxTokens": 2000,
  "responseFormat": "json"
}
```

## Testing the Integration

### 1. Mock Mode (Current)
- Works immediately without Flowise setup
- Returns realistic sample recipes
- Perfect for UI testing and development

### 2. Development Mode
- Set `FLOWISE_API_KEY` in `.env`
- Update `callFlowiseForRecipes()` in `/src/utils/flowiseApi.js`
- Uncomment the actual API call code

### 3. Production Mode
- Configure production Flowise instance
- Set proper environment variables
- Monitor API usage and responses

## File Structure

```
src/
├── utils/
│   └── flowiseApi.js        # Centralized Flowise integration
├── actions.js               # Server actions with preference injection
└── pages/
    └── RecipeGenerator.jsx  # UI for recipe generation
```

## Preference Injection System

The system automatically injects user preferences into every AI request:

```javascript
// Example injected context:
`User Dietary Preferences:
- Dietary restrictions: Vegetarian, Dairy-free
- Preferred protein sources: Plant-based proteins
- Allergies: Nuts, Shellfish
- Food intolerances: Lactose
- Daily carb limit: 20g net carbs
- Keto experience level: intermediate
- Primary goal: weight_loss

CRITICAL: Only suggest recipes that are safe for this user and respect ALL dietary restrictions and allergies listed above.`
```

## Next Steps

1. **Set up Flowise instance** with Claude integration
2. **Create recipe generation flow** using the provided configuration
3. **Update environment variables** with your Flowise details
4. **Test with real ingredients** to verify AI responses
5. **Monitor and refine** prompts based on user feedback

## Troubleshooting

**No recipes generated**: Check Flowise connection and API key
**Invalid recipes**: Verify JSON format in Flowise response
**Preferences ignored**: Check prompt formatting in buildUserPreferenceContext()
**API errors**: Check Flowise logs and rate limits