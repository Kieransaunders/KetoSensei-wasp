// Flowise API integration utility
// This file centralizes all Flowise API calls for easier management

/**
 * Configuration for Flowise API
 */
const FLOWISE_CONFIG = {
  // TODO: Replace with actual Flowise endpoint
  baseUrl: process.env.FLOWISE_API_URL || 'http://localhost:3000',
  apiKey: process.env.FLOWISE_API_KEY || '',
  flows: {
    recipeGeneration: process.env.FLOWISE_RECIPE_FLOW_ID || 'recipe-flow-id',
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
  // TODO: Replace with actual Flowise API implementation
  console.log('🔄 Calling Flowise API for recipe generation...');
  console.log('Prompt:', prompt);
  console.log('User ID:', userId);

  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development' || !FLOWISE_CONFIG.apiKey) {
      return getMockRecipes(prompt);
    }

    // Actual Flowise API call (uncomment when ready)
    /*
    const response = await fetch(`${FLOWISE_CONFIG.baseUrl}/api/v1/prediction/${FLOWISE_CONFIG.flows.recipeGeneration}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FLOWISE_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        question: prompt,
        sessionId: `user_${userId}_recipes`,
        overrideConfig: {
          temperature: 0.7,
          maxTokens: 2000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the JSON response from Claude
    try {
      const recipes = JSON.parse(data.text || data.response);
      return Array.isArray(recipes) ? recipes : [recipes];
    } catch (parseError) {
      console.error('Failed to parse recipe JSON:', data.text);
      throw new Error('Invalid recipe format from AI');
    }
    */

    // For now, return mock data
    return getMockRecipes(prompt);

  } catch (error) {
    console.error('Flowise API call failed:', error);
    throw new Error('Failed to generate recipes. Please try again.');
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