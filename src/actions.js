import { HttpError } from 'wasp/server'
import { callFlowiseForRecipes, validateAndFormatRecipes } from './utils/flowiseApi.js'

export const updateUserPreferences = async (data, context) => {
  if (!context.user) { throw new HttpError(401); }

  // Check if preferences exist, create if not
  let userPreferences = await context.entities.UserPreferences.findUnique({
    where: { userId: context.user.id }
  });

  if (!userPreferences) {
    return context.entities.UserPreferences.create({
      data: {
        userId: context.user.id,
        ...data
      }
    });
  } else {
    return context.entities.UserPreferences.update({
      where: { userId: context.user.id },
      data: data
    });
  }
}

export const createMealPlan = async ({ weekStart, meals }, context) => {
  if (!context.user) { throw new HttpError(401); }

  try {
    const newMealPlan = await context.entities.MealPlan.create({
      data: {
        userId: context.user.id,
        weekStart: new Date(weekStart)
      }
    });

    // Create meals separately and link recipes
    for (const meal of meals) {
      const newMeal = await context.entities.Meal.create({
        data: {
          mealPlanId: newMealPlan.id,
          type: meal.type
        }
      });

      // For now, we'll store recipe references in the meal type string
      // Since system recipes shouldn't be modified, we'll handle this differently
      // The meal plan will be saved without directly linking recipes to avoid conflicts
    }

    return newMealPlan;
  } catch (error) {
    console.error('Error creating meal plan:', error);
    throw new HttpError(500, 'Failed to create meal plan');
  }
}

export const addRecipeToFavorites = async ({ recipeId }, context) => {
  if (!context.user) { throw new HttpError(401); }

  const recipe = await context.entities.Recipe.findUnique({
    where: { id: recipeId }
  });
  if (!recipe) { throw new HttpError(404, 'Recipe not found'); }

  // Toggle the favorite status
  const newFavoriteStatus = !recipe.isFavorite;

  return context.entities.Recipe.update({
    where: { id: recipeId },
    data: { isFavorite: newFavoriteStatus }
  });
}

export const trackStreak = async ({ type }, context) => {
  if (!context.user) { throw new HttpError(401); }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const streak = await context.entities.Streak.findUnique({
    where: { userId_type: { userId: context.user.id, type } }
  });

  if (!streak) {
    // Create new streak
    const newStreak = await context.entities.Streak.create({
      data: { 
        userId: context.user.id, 
        type, 
        currentStreak: 1, 
        maxStreak: 1,
        lastCheckIn: now
      }
    });
    return { streak: newStreak, message: getBeltMessage(1), alreadyCheckedIn: false };
  } else {
    // Check if already checked in today
    if (streak.lastCheckIn) {
      const lastCheckIn = new Date(streak.lastCheckIn);
      const lastCheckInDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
      
      if (lastCheckInDate.getTime() === today.getTime()) {
        return { streak, message: "Patience, grasshopper. You have already shown your dedication today. Return tomorrow for new wisdom.", alreadyCheckedIn: true };
      }
    }

    // Calculate new streak
    let newCurrentStreak;
    if (streak.lastCheckIn) {
      const lastCheckIn = new Date(streak.lastCheckIn);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastCheckInDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
      
      if (lastCheckInDate.getTime() === yesterday.getTime()) {
        // Consecutive day
        newCurrentStreak = streak.currentStreak + 1;
      } else {
        // Streak broken, start over
        newCurrentStreak = 1;
      }
    } else {
      newCurrentStreak = 1;
    }

    const newMaxStreak = Math.max(streak.maxStreak, newCurrentStreak);
    
    const updatedStreak = await context.entities.Streak.update({
      where: { id: streak.id },
      data: { 
        currentStreak: newCurrentStreak, 
        maxStreak: newMaxStreak,
        lastCheckIn: now
      }
    });

    return { 
      streak: updatedStreak, 
      message: getBeltMessage(newCurrentStreak), 
      alreadyCheckedIn: false 
    };
  }
}

export const addWaterGlass = async (args, context) => {
  if (!context.user) { throw new HttpError(401); }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Find or create today's water intake record
  let waterIntake = await context.entities.WaterIntake.findUnique({
    where: { 
      userId_date: { 
        userId: context.user.id, 
        date: today 
      } 
    }
  });

  if (!waterIntake) {
    // Create new water intake record for today
    waterIntake = await context.entities.WaterIntake.create({
      data: { 
        userId: context.user.id, 
        glasses: 1,
        date: today
      }
    });
  } else {
    // Increment glasses count (max 8 glasses per day)
    const newGlassCount = Math.min(waterIntake.glasses + 1, 8);
    waterIntake = await context.entities.WaterIntake.update({
      where: { id: waterIntake.id },
      data: { glasses: newGlassCount }
    });
  }

  return waterIntake;
}

export const generateRecipeFromIngredients = async ({ ingredients }, context) => {
  if (!context.user) { throw new HttpError(401); }

  try {
    // 1. Get user preferences
    const userContext = await buildUserPreferenceContext(context.user.id, context);
    
    // 2. Format ingredients
    const ingredientList = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;
    
    // 3. Build concise prompt for faster processing
    const prompt = `${userContext}

INGREDIENTS: ${ingredientList}

Generate 3 keto recipes using these ingredients. Format as JSON:
[{"title":"Name","ingredients":["item1","item2"],"instructions":["step1","step2"],"prepTime":"15min","servings":2,"netCarbs":"5g"}]

Return only JSON array.`;

    // 4. Call Flowise API with streaming support
    const rawRecipes = await callFlowiseForRecipes(prompt, context.user.id);
    const recipes = validateAndFormatRecipes(rawRecipes);
    
    // 5. Save generated recipes to database
    const savedRecipes = [];
    for (const recipe of recipes) {
      const savedRecipe = await context.entities.Recipe.create({
        data: {
          name: recipe.title,
          type: 'generated',
          ingredients: JSON.stringify(recipe.ingredients),
          instructions: Array.isArray(recipe.instructions) 
            ? recipe.instructions.join('\n') 
            : recipe.instructions,
          userId: context.user.id,
          isFavorite: false
        }
      });
      savedRecipes.push({
        ...savedRecipe,
        prepTime: recipe.prepTime,
        servings: recipe.servings,
        netCarbs: recipe.netCarbs
      });
    }

    return {
      success: true,
      recipes: savedRecipes,
      inputIngredients: ingredientList
    };

  } catch (error) {
    console.error('Error generating recipes:', error);
    throw new HttpError(500, 'Failed to generate recipes. Please try again.');
  }
}

// New streaming version for real-time updates (future enhancement)
export const generateRecipeFromIngredientsStream = async ({ ingredients }, context) => {
  if (!context.user) { throw new HttpError(401); }

  try {
    // This could be extended to support SSE (Server-Sent Events) in the future
    // For now, it uses the same logic but could be enhanced for real-time streaming to frontend
    return await generateRecipeFromIngredients({ ingredients }, context);
  } catch (error) {
    console.error('Error generating recipes (stream):', error);
    throw new HttpError(500, 'Failed to generate recipes. Please try again.');
  }
}

// Helper function to build user preference context
async function buildUserPreferenceContext(userId, context) {
  const preferences = await context.entities.UserPreferences.findUnique({
    where: { userId }
  });

  if (!preferences) {
    return `User Dietary Preferences: Standard keto diet (no specific restrictions)`;
  }

  const dietaryRestrictions = [];
  if (preferences.vegetarian) dietaryRestrictions.push('Vegetarian');
  if (preferences.vegan) dietaryRestrictions.push('Vegan'); 
  if (preferences.pescatarian) dietaryRestrictions.push('Pescatarian');
  if (preferences.dairyFree) dietaryRestrictions.push('Dairy-free');
  if (preferences.glutenFree) dietaryRestrictions.push('Gluten-free');
  if (preferences.nutFree) dietaryRestrictions.push('Nut-free');

  const allergies = preferences.allergies ? JSON.parse(preferences.allergies) : [];
  const intolerances = preferences.intolerances ? JSON.parse(preferences.intolerances) : [];
  const proteinSources = preferences.proteinSources ? JSON.parse(preferences.proteinSources) : [];

  return `User Dietary Preferences:
- Dietary restrictions: ${dietaryRestrictions.length ? dietaryRestrictions.join(', ') : 'None'}
- Preferred protein sources: ${proteinSources.length ? proteinSources.join(', ') : 'Any keto-friendly proteins'}
- Allergies: ${allergies.length ? allergies.join(', ') : 'None'}
- Food intolerances: ${intolerances.length ? intolerances.join(', ') : 'None'}
- Daily carb limit: ${preferences.carbLimit || 20}g net carbs
- Keto experience level: ${preferences.ketoExperience || 'beginner'}
- Primary goal: ${preferences.primaryGoal || 'general health'}

CRITICAL: Only suggest recipes that are safe for this user and respect ALL dietary restrictions and allergies listed above.`;
}

function getBeltMessage(streakCount) {
  if (streakCount >= 365) return "🥋 BLACK BELT MASTER! You have achieved the ultimate discipline. Even the ancient masters bow before your dedication!";
  if (streakCount >= 180) return "🟫 Brown Belt Warrior! Your consistency is legendary. You are one with the keto way.";
  if (streakCount >= 90) return "🔵 Blue Belt Champion! Your dedication burns bright like a flame. The path to mastery is clear.";
  if (streakCount >= 45) return "🟢 Green Belt Student! Your growth is like bamboo - steady and strong. Continue this noble path.";
  if (streakCount >= 21) return "🟠 Orange Belt Learner! You show the discipline of a true warrior. The sensei is pleased.";
  if (streakCount >= 7) return "🟡 Yellow Belt Beginner! Good, grasshopper! You have taken the first steps on the path of discipline.";
  if (streakCount >= 3) return "⚪ White Belt Novice! The journey of a thousand miles begins with a single step. Well done!";
  return "🥋 Welcome, young grasshopper! Every master was once a beginner. Your journey starts now!";
}
