// Simple in-memory cache for recipe generation
// Add this to your flowiseApi.js

const recipeCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedRecipes(ingredients) {
  const key = ingredients.toLowerCase().split(',').sort().join(',').trim();
  const cached = recipeCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🚀 Using cached recipes for:', ingredients);
    return cached.recipes;
  }
  
  return null;
}

export function setCachedRecipes(ingredients, recipes) {
  const key = ingredients.toLowerCase().split(',').sort().join(',').trim();
  recipeCache.set(key, {
    recipes,
    timestamp: Date.now()
  });
  
  console.log('💾 Cached recipes for:', ingredients);
}

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of recipeCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      recipeCache.delete(key);
    }
  }
}, CACHE_DURATION);
