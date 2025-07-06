// Flowise API integration utility
// This file centralizes all Flowise API calls for easier management

import { getCachedRecipes, setCachedRecipes } from './recipeCache.js';

/**
 * Configuration for Flowise API
 */
const FLOWISE_CONFIG = {
  // Your actual Flowise instance
  baseUrl: process.env.FLOWISE_API_URL || 'https://flowise.iconnectit.co.uk',
  apiKey: process.env.FLOWISE_API_KEY || 'BMErGUIYUOJdHNvQSs5j2UFsLdWtt47BOwCrWN-qm8I',
  flows: {
    recipeGeneration: process.env.FLOWISE_RECIPE_FLOW_ID || '8fe26341-e8c2-4745-9d1c-447e96822743',
    dailyMotivation: process.env.FLOWISE_MOTIVATION_FLOW_ID || 'motivation-flow-id',
    mealPlanning: process.env.FLOWISE_MEAL_PLAN_FLOW_ID || 'meal-plan-flow-id'
  }
};

/**
 * Call Flowise API for recipe generation
 * @param {string} prompt - The formatted prompt including user preferences
 * @param {string} userId - User ID for session management
 * @returns {Promise<Array>} - Array of generated recipes
 */
export async function callFlowiseForRecipes(prompt, userId) {
  console.log('🔄 Calling Flowise API for recipe generation...');
  console.log('User ID:', userId);

  try {
    // Extract ingredients for caching
    const ingredientMatch = prompt.match(/INGREDIENTS: (.+)/);
    const ingredients = ingredientMatch ? ingredientMatch[1] : '';
    
    // Check cache first
    const cachedRecipes = getCachedRecipes(ingredients);
    if (cachedRecipes) {
      return cachedRecipes;
    }

    // Use real API if we have proper configuration
    const hasValidConfig = FLOWISE_CONFIG.apiKey && 
                          FLOWISE_CONFIG.baseUrl && 
                          FLOWISE_CONFIG.flows.recipeGeneration;
    
    if (!hasValidConfig) {
      console.log('🔄 Missing Flowise config, using mock data');
      return getMockRecipes(prompt);
    }

    // ACTUAL Flowise API call with streaming enabled
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds for streaming

    const response = await fetch(`${FLOWISE_CONFIG.baseUrl}/api/v1/prediction/${FLOWISE_CONFIG.flows.recipeGeneration}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        // Add authorization if API key is set
        ...(FLOWISE_CONFIG.apiKey && { 'Authorization': `Bearer ${FLOWISE_CONFIG.apiKey}` })
      },
      body: JSON.stringify({
        question: prompt,
        sessionId: `user_${userId}_recipes`,
        streaming: true,  // Enable streaming for real-time responses
        overrideConfig: {
          temperature: 0.5,  // Lower temperature = faster, more focused responses
          maxTokens: 800,    // Reduced significantly for faster response
          sessionId: `user_${userId}_recipes`
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.status} ${response.statusText}`);
    }

    // Handle streaming response
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      console.log('📡 Processing streaming response...');
      return await handleStreamingResponse(response, ingredients);
    }

    // Fallback to non-streaming response handling
    const data = await response.json();
    console.log('✅ Flowise API response received');
    
    // Parse the JSON response from Claude
    try {
      // Flowise returns different response formats, handle both
      const responseText = data.text || data.response || data;
      
      // If it's already an object, use it directly
      if (typeof responseText === 'object') {
        const recipes = Array.isArray(responseText) ? responseText : [responseText];
        setCachedRecipes(ingredients, recipes); // Cache the result
        return recipes;
      }
      
      // Try to parse as JSON
      const recipes = JSON.parse(responseText);
      const recipeArray = Array.isArray(recipes) ? recipes : [recipes];
      setCachedRecipes(ingredients, recipeArray); // Cache the result
      return recipeArray;
      
    } catch (parseError) {
      console.error('Failed to parse recipe JSON:', data);
      // If JSON parsing fails, try to extract recipes from text response
      const fallbackRecipes = extractRecipesFromText(data.text || data.response || JSON.stringify(data));
      if (fallbackRecipes.length > 0) {
        setCachedRecipes(ingredients, fallbackRecipes); // Cache the result
        return fallbackRecipes;
      }
      throw new Error('Invalid recipe format from AI');
    }

  } catch (error) {
    console.error('Flowise API call failed:', error);
    
    // Fallback to mock data in case of API failure
    console.log('🔄 Falling back to mock data...');
    return getMockRecipes(prompt);
  }
}

/**
 * Handle streaming response from Flowise API
 * @param {Response} response - Fetch response object with streaming data
 * @param {string} ingredients - Original ingredients for caching
 * @returns {Promise<Array>} - Parsed recipes from stream
 */
async function handleStreamingResponse(response, ingredients) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            break;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              fullResponse += parsed.token;
            } else if (parsed.text) {
              fullResponse += parsed.text;
            }
          } catch (e) {
            // If it's not JSON, it might be plain text
            if (data && data !== '') {
              fullResponse += data;
            }
          }
        }
      }
    }
    
    console.log('🔄 Stream completed, parsing recipes...');
    
    // Parse the complete response
    try {
      // Try to parse as JSON array first
      const recipes = JSON.parse(fullResponse);
      const recipeArray = Array.isArray(recipes) ? recipes : [recipes];
      setCachedRecipes(ingredients, recipeArray);
      return recipeArray;
    } catch (parseError) {
      // Fallback to text extraction
      const fallbackRecipes = extractRecipesFromText(fullResponse);
      if (fallbackRecipes.length > 0) {
        setCachedRecipes(ingredients, fallbackRecipes);
        return fallbackRecipes;
      }
      throw new Error('Failed to parse streamed response');
    }
    
  } finally {
    reader.releaseLock();
  }
}

/**
 * Extract recipes from text response when JSON parsing fails
 * @param {string} text - Raw text response from AI
 * @returns {Array} - Extracted recipes
 */
function extractRecipesFromText(text) {
  try {
    // Look for JSON blocks in the text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, create a single recipe from the text
    return [{
      title: "AI Generated Recipe",
      ingredients: ["Based on your requested ingredients"],
      instructions: text.split('\n').filter(line => line.trim()),
      prepTime: "15 minutes",
      servings: 1,
      netCarbs: "Estimated keto-friendly"
    }];
  } catch {
    return [];
  }
}/**
 * Call Flowise API for daily motivation
 * @param {Object} userContext - User's streak and progress data
 * @returns {Promise<string>} - Motivational message
 */
export async function callFlowiseForMotivation(userContext) {
  console.log('🔄 Calling Flowise API for daily motivation...');
  
  try {
    // Mock implementation for development
    const messages = [
      "🥋 Discipline is choosing between what you want now and what you want most. Stay strong, warrior!",
      "🌟 Every meal is a choice. Every choice is a step on your journey. Walk with purpose.",
      "⚡ The ketones flow through you like chi through a master. Feel the energy!",
      "🎯 Focus, grasshopper. Your goals await beyond the carb-laden distractions.",
      "🔥 Your consistency burns brighter than a thousand suns. The sensei is proud!"
    ];
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];

  } catch (error) {
    console.error('Motivation API call failed:', error);
    return "🥋 The path of the warrior is never easy, but it is always worth walking.";
  }
}

/**
 * Mock recipe generator for development
 * @param {string} prompt - The input prompt
 * @returns {Array} - Mock recipes
 */
function getMockRecipes(prompt) {
  // Extract ingredients from prompt for more realistic mock data
  const ingredientMatch = prompt.match(/INGREDIENTS TO USE: (.+)/);
  const ingredients = ingredientMatch ? ingredientMatch[1].toLowerCase() : '';

  // Generate different recipes based on ingredients
  const mockRecipeTemplates = [
    {
      title: "Keto Power Bowl",
      ingredients: ["protein source", "leafy greens", "healthy fats", "low-carb vegetables"],
      instructions: ["Season and cook protein", "Prepare fresh vegetables", "Combine with healthy fats", "Serve in a bowl"],
      prepTime: "15 minutes",
      servings: 1,
      netCarbs: "6g per serving"
    },
    {
      title: "Quick Keto Stir-Fry", 
      ingredients: ["main protein", "mixed vegetables", "cooking oil", "seasonings"],
      instructions: ["Heat oil in pan", "Add protein and cook until done", "Add vegetables and stir-fry", "Season to taste"],
      prepTime: "12 minutes",
      servings: 2,
      netCarbs: "5g per serving"
    },
    {
      title: "Creamy Keto Delight",
      ingredients: ["primary ingredient", "cream or cheese", "herbs", "optional nuts"],
      instructions: ["Prepare main ingredient", "Create creamy sauce", "Combine and heat gently", "Garnish with herbs"],
      prepTime: "18 minutes", 
      servings: 1,
      netCarbs: "7g per serving"
    }
  ];

  // Customize recipes based on actual ingredients
  return mockRecipeTemplates.map((template, index) => {
    const actualIngredients = ingredients.split(',').map(i => i.trim());
    
    return {
      title: `${template.title} with ${actualIngredients[0] || 'Keto Ingredients'}`,
      ingredients: actualIngredients.length > 0 ? actualIngredients : template.ingredients,
      instructions: template.instructions,
      prepTime: template.prepTime,
      servings: template.servings,
      netCarbs: template.netCarbs
    };
  });
}/**
 * Validate recipe format from AI response
 * @param {Array} recipes - Raw recipes from AI
 * @returns {Array} - Validated and formatted recipes
 */
export function validateAndFormatRecipes(recipes) {
  if (!Array.isArray(recipes)) {
    throw new Error('Recipes must be an array');
  }

  return recipes.map((recipe, index) => {
    // Ensure required fields exist
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error(`Recipe ${index + 1} is missing required fields`);
    }

    return {
      title: recipe.title.trim(),
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : recipe.ingredients.split(',').map(i => i.trim()),
      instructions: Array.isArray(recipe.instructions)
        ? recipe.instructions
        : recipe.instructions,
      prepTime: recipe.prepTime || '15 minutes',
      servings: recipe.servings || 1,
      netCarbs: recipe.netCarbs || 'Unknown'
    };
  });
}

export { FLOWISE_CONFIG };