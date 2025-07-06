import { HttpError } from 'wasp/server'

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
