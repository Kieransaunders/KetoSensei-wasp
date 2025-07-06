# 🔌 Flowise Integration Guide

This guide explains how to connect KetoSensei with Flowise for AI-powered recipe generation.

## ✅ Flowise API Integration (CONFIRMED WORKING)

**Yes! Flowise has a comprehensive REST API** for integrating with external applications.

### **API Endpoint Structure**
```
POST {FLOWISE_URL}/api/v1/prediction/{CHATFLOW_ID}

Content-Type: application/json
Authorization: Bearer {API_KEY}  // Optional, if API key protection enabled
```

### **Request Format**
```javascript
{
  "question": "Your prompt here",
  "sessionId": "user_123_recipes",     // For conversation memory
  "streaming": false,                  // true for real-time streaming
  "overrideConfig": {
    "temperature": 0.7,               // AI creativity level
    "maxTokens": 2000,               // Response length limit
    "sessionId": "user_123_recipes"  // Maintain conversation context
  }
}
```

### **Response Format**
```javascript
{
  "text": "AI response here",           // Main response content
  "response": "AI response here",    // Alternative response field
  "sessionId": "user_123_recipes",   // Session identifier
  "chatId": "chat_id_here"          // Chat identifier
}
```

## 🚀 Quick Setup Steps

### **1. Copy Environment Template**
```bash
cp .env.example .env
```

### **2. Set Up Flowise Instance**
- **Local Setup**: `npx flowise start` (runs on http://localhost:3000)
- **Cloud Setup**: Deploy Flowise to your preferred cloud provider
- **Docker Setup**: Use official Flowise Docker images

### **3. Create Recipe Generation Chatflow**
1. Open Flowise UI (http://localhost:3000)
2. Create new Chatflow
3. Add Claude/OpenAI model node
4. Configure with your API keys
5. Set system message for recipe generation
6. Save and note the Chatflow ID

### **4. Update Environment Variables**
```bash
# .env file
FLOWISE_API_URL="http://localhost:3000"
FLOWISE_API_KEY="your-api-key-if-enabled"  # Optional
FLOWISE_RECIPE_FLOW_ID="your-chatflow-id"   # From step 3
```

### **5. Test Integration**
```bash
npm run dev                    # Start KetoSensei
# Navigate to /generate-recipes
# Enter ingredients and test recipe generation
```

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