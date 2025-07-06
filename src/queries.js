import { HttpError } from 'wasp/server'

export const getUserPreferences = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }

  let preferences = await context.entities.UserPreferences.findUnique({
    where: { userId: context.user.id }
  });

  // Create default preferences if none exist
  if (!preferences) {
    preferences = await context.entities.UserPreferences.create({
      data: {
        userId: context.user.id,
        vegetarian: false,
        vegan: false,
        pescatarian: false,
        dairyFree: false,
        glutenFree: false,
        nutFree: false,
        proteinSources: JSON.stringify([]),
        allergies: JSON.stringify([]),
        intolerances: JSON.stringify([]),
        carbLimit: 20,
        intermittentFasting: false,
        fastingHours: 16,
        ketoExperience: '',
        primaryGoal: ''
      }
    });
  }

  return preferences;
}

export const getMealPlans = async (args, context) => {
  if (!context.user) { throw new HttpError(401); }

  return context.entities.MealPlan.findMany({
    where: { userId: context.user.id },
    include: { meals: true }
  });
}

export const getRecipes = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }

  // Get both user's personal recipes and system recipes (userId = 1)
  const whereClause = { 
    OR: [
      { userId: context.user.id },  // User's personal recipes
      { userId: 1 }                 // System recipes (shared)
    ]
  };
  
  if (args.type) {
    whereClause.type = args.type;
  }
  if (args.isFavorite !== undefined) {
    whereClause.isFavorite = args.isFavorite;
  }

  return context.entities.Recipe.findMany({
    where: whereClause,
    orderBy: [
      { userId: 'asc' },  // System recipes first
      { name: 'asc' }     // Then alphabetical
    ]
  });
}

export const getStreaks = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }

  return context.entities.Streak.findMany({
    where: { userId: context.user.id },
    select: {
      type: true,
      currentStreak: true,
      maxStreak: true,
      lastCheckIn: true
    }
  });
}

export const getTodaysTip = async (args, context) => {
  // Get current day of year (1-365)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Find tip for today, if none exists, get a random one
  let tip = await context.entities.DailyTip.findFirst({
    where: { 
      dayOfYear: dayOfYear,
      isActive: true 
    }
  });

  // Fallback to random tip if none for today
  if (!tip) {
    const tipCount = await context.entities.DailyTip.count({
      where: { isActive: true }
    });
    
    if (tipCount > 0) {
      const randomSkip = Math.floor(Math.random() * tipCount);
      tip = await context.entities.DailyTip.findFirst({
        where: { isActive: true },
        skip: randomSkip
      });
    }
  }

  return tip;
}
