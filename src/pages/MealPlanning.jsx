import React, { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getMealPlans, createMealPlan, getUserPreferences, getRecipes } from 'wasp/client/operations';

const MealPlanningPage = () => {
  const { data: mealPlans, isLoading: mealPlansLoading, error: mealPlansError, refetch } = useQuery(getMealPlans);
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery(getUserPreferences);
  const { data: recipes, isLoading: recipesLoading } = useQuery(getRecipes);
  const createMealPlanFn = useAction(createMealPlan);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeRecipeTab, setActiveRecipeTab] = useState('ingredients');
  const [weekMeals, setWeekMeals] = useState({});
  const [saveMessage, setSaveMessage] = useState('');
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);

  // Generate the next 7 days starting from today
  const getWeekDates = (date = new Date()) => {
    const week = [];
    const startDate = new Date(date);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      week.push(currentDate);
    }
    return week;
  };

  const [weekDates, setWeekDates] = useState(getWeekDates());

  useEffect(() => {
    setWeekDates(getWeekDates(selectedDate));
  }, [selectedDate]);

  // Load existing meal plans from database
  useEffect(() => {
    if (mealPlans && recipes && Object.keys(weekMeals).length === 0) {
      // Only load from database if we don't have generated meals in memory
      loadExistingMealPlans();
    }
  }, [mealPlans, recipes]);

  const loadExistingMealPlans = () => {
    const loadedWeekMeals = {};
    
    if (mealPlans && mealPlans.length > 0) {
      // Find the most recent meal plan that covers our date range
      const currentWeekStart = weekDates[0].toDateString();
      const relevantPlan = mealPlans.find(plan => {
        const planStart = new Date(plan.weekStart).toDateString();
        return planStart === currentWeekStart;
      });

      if (relevantPlan && relevantPlan.meals) {
        relevantPlan.meals.forEach(meal => {
          // Parse the meal type string (e.g., "12/6/2024 - Breakfast")
          const [dateStr, mealType] = meal.type.split(' - ');
          const dateKey = new Date(dateStr).toDateString();
          
          if (meal.recipes && meal.recipes.length > 0) {
            const recipeId = meal.recipes[0];
            const recipe = recipes.find(r => r.id === recipeId);
            
            if (recipe) {
              if (!loadedWeekMeals[dateKey]) {
                loadedWeekMeals[dateKey] = {};
              }
              loadedWeekMeals[dateKey][mealType] = recipe;
            }
          }
        });
      }
    }
    
    setWeekMeals(loadedWeekMeals);
  };

  if (mealPlansLoading || preferencesLoading || recipesLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-900">
        <div className="text-lg text-white">Loading your meal planning dojo...</div>
      </div>
    );
  }

  if (mealPlansError) {
    return (
      <div className="p-6 bg-red-900 border border-red-700 rounded-lg">
        <div className="text-red-300">Error loading meal plans: {mealPlansError}</div>
      </div>
    );
  }

  const getFilteredRecipes = (mealType) => {
    if (!recipes) return [];
    
    // First try to get recipes that match the meal type exactly
    let filteredRecipes = recipes.filter(recipe => {
      const recipeType = recipe.type?.toLowerCase() || '';
      const targetType = mealType.toLowerCase();
      
      return recipeType === targetType || 
             (targetType === 'snack' && ['snack', 'appetizer', 'side'].includes(recipeType));
    });
    
    // If no exact matches, be more flexible and include recipes with no type or similar types
    if (filteredRecipes.length === 0) {
      filteredRecipes = recipes.filter(recipe => {
        const recipeType = recipe.type?.toLowerCase() || '';
        
        // Allow recipes with no type, or similar types
        return !recipeType || 
               recipeType === 'generated' ||
               (mealType === 'Breakfast' && ['breakfast', 'snack'].includes(recipeType)) ||
               (mealType === 'Lunch' && ['lunch', 'dinner', 'snack'].includes(recipeType)) ||
               (mealType === 'Dinner' && ['dinner', 'lunch'].includes(recipeType));
      });
    }
    
    // If still no matches, just use any available recipes (fallback)
    if (filteredRecipes.length === 0) {
      filteredRecipes = recipes.slice(); // Use all recipes as fallback
    }
    
    // Apply dietary restrictions only if user preferences are loaded
    if (userPreferences && filteredRecipes.length > 0) {
      const finalFiltered = filteredRecipes.filter(recipe => {
        const recipeName = recipe.name?.toLowerCase() || '';
        const recipeIngredients = recipe.ingredients?.toLowerCase() || '';
        
        // Only apply dietary restrictions if they are explicitly set to true
        if (userPreferences.vegetarian === true) {
          const meatKeywords = ['beef', 'chicken', 'pork', 'turkey', 'lamb', 'duck'];
          if (meatKeywords.some(meat => recipeName.includes(meat) || recipeIngredients.includes(meat))) {
            return false;
          }
        }

        if (userPreferences.vegan === true) {
          const animalKeywords = ['cheese', 'egg', 'milk', 'butter', 'cream', 'yogurt', 'meat', 'chicken', 'beef'];
          if (animalKeywords.some(animal => recipeName.includes(animal) || recipeIngredients.includes(animal))) {
            return false;
          }
        }

        if (userPreferences.dairyFree === true) {
          const dairyKeywords = ['cheese', 'milk', 'butter', 'cream', 'yogurt'];
          if (dairyKeywords.some(dairy => recipeName.includes(dairy) || recipeIngredients.includes(dairy))) {
            return false;
          }
        }

        return true;
      });
      
      // If dietary restrictions filtered out everything, use original filtered recipes
      return finalFiltered.length > 0 ? finalFiltered : filteredRecipes;
    }
    
    return filteredRecipes;
  };

  const saveMealPlanToDatabase = async (weekMealsData) => {
    // Convert the weekMealsData to the format expected by the backend
    const mealsForBackend = [];
    
    Object.entries(weekMealsData).forEach(([dateKey, dayMeals]) => {
      Object.entries(dayMeals).forEach(([mealType, recipe]) => {
        if (recipe) {
          mealsForBackend.push({
            type: `${new Date(dateKey).toLocaleDateString()} - ${mealType} - ${recipe.name}`,
            recipes: [] // Don't link recipes directly to avoid conflicts with system recipes
          });
        }
      });
    });

    await createMealPlanFn({
      weekStart: weekDates[0].toISOString(),
      meals: mealsForBackend
    });

    refetch(); // Refresh the meal plans query
  };

  const generateWeekMeals = async () => {
    const newWeekMeals = {};
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
    
    weekDates.forEach(date => {
      const dateKey = date.toDateString();
      newWeekMeals[dateKey] = {};
      
      mealTypes.forEach(mealType => {
        const availableRecipes = getFilteredRecipes(mealType);
        
        if (availableRecipes.length > 0) {
          const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
          newWeekMeals[dateKey][mealType] = randomRecipe;
        }
      });
    });
    setWeekMeals(newWeekMeals);
    
    // Force a re-render by updating a dummy state
    setSelectedDate(new Date(selectedDate));
    
    // Auto-save to database
    try {
      await saveMealPlanToDatabase(newWeekMeals);
      setSaveMessage("Next 7 days planned and saved with sensei wisdom! 🥋💾");
    } catch (error) {
      console.error('Error saving meal plan:', error);
      setSaveMessage("Meals planned but sensei had trouble saving. Try again, grasshopper.");
    }
    
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDateNumber = (date) => {
    return date.getDate();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const selectedDateKey = selectedDate.toDateString();
  const todayMeals = weekMeals[selectedDateKey] || {};
  
  // Standard meal types to always show
  const standardMealTypes = ['Breakfast', 'Lunch', 'Dinner'];
  
  // Ensure we always show the standard meal slots, even if empty
  const mealsToDisplay = {};
  standardMealTypes.forEach(mealType => {
    mealsToDisplay[mealType] = todayMeals[mealType] || null;
  });

  const getMacros = (recipe) => {
    // Mock macro calculation - in a real app, this would be calculated from ingredients
    const mockMacros = {
      carbs: Math.floor(Math.random() * 10) + 2,
      protein: Math.floor(Math.random() * 30) + 15,
      fat: Math.floor(Math.random() * 40) + 15
    };
    return mockMacros;
  };

  const getMealTime = (mealType) => {
    const times = {
      'Breakfast': '7:00 - 8:00 AM',
      'Lunch': '12:00 - 1:00 PM',
      'Dinner': '6:00 - 7:00 PM'
    };
    return times[mealType] || '';
  };

  // Shopping list generation logic
  const generateShoppingList = () => {
    const ingredientMap = new Map();
    const categorizedIngredients = {
      'Proteins': [],
      'Vegetables': [], 
      'Dairy & Eggs': [],
      'Fats & Oils': [],
      'Pantry': [],
      'Herbs & Spices': [],
      'Other': []
    };

    // Extract ingredients from all meals in the week
    Object.values(weekMeals).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipe => {
        if (recipe && recipe.ingredients) {
          let ingredients;
          
          try {
            // Try to parse as JSON first (for generated recipes)
            ingredients = JSON.parse(recipe.ingredients);
          } catch {
            // If not JSON, split by common delimiters
            ingredients = recipe.ingredients
              .split(/[;,\n]/)
              .map(item => item.trim())
              .filter(item => item.length > 0);
          }

          ingredients.forEach(ingredient => {
            const cleanIngredient = ingredient.trim().toLowerCase();
            if (cleanIngredient) {
              // Count occurrences and store original casing
              if (ingredientMap.has(cleanIngredient)) {
                ingredientMap.get(cleanIngredient).count++;
              } else {
                ingredientMap.set(cleanIngredient, {
                  original: ingredient.trim(),
                  count: 1,
                  checked: false,
                  category: categorizeIngredient(cleanIngredient)
                });
              }
            }
          });
        }
      });
    });

    // Convert to categorized shopping list
    ingredientMap.forEach((data, key) => {
      const item = {
        id: key,
        name: data.original,
        count: data.count,
        checked: data.checked,
        category: data.category
      };
      
      categorizedIngredients[data.category].push(item);
    });

    // Sort each category alphabetically
    Object.keys(categorizedIngredients).forEach(category => {
      categorizedIngredients[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    setShoppingList(categorizedIngredients);
    setShowShoppingList(true);
  };

  // Categorize ingredients by type
  const categorizeIngredient = (ingredient) => {
    const proteins = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'lamb', 'shrimp', 'crab', 'bacon', 'sausage', 'ham', 'venison'];
    const vegetables = ['spinach', 'kale', 'broccoli', 'cauliflower', 'zucchini', 'cucumber', 'tomato', 'lettuce', 'avocado', 'bell pepper', 'onion', 'garlic', 'mushroom', 'asparagus', 'cabbage', 'celery'];
    const dairy = ['cheese', 'cream', 'butter', 'egg', 'milk', 'yogurt', 'mozzarella', 'cheddar', 'parmesan'];
    const fats = ['olive oil', 'coconut oil', 'avocado oil', 'macadamia', 'almond', 'walnut', 'pecan', 'nut'];
    const herbs = ['basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro', 'dill', 'sage', 'pepper', 'salt', 'paprika', 'cumin', 'turmeric'];
    const pantry = ['vinegar', 'lemon', 'lime', 'broth', 'stock', 'flour', 'powder', 'extract'];

    ingredient = ingredient.toLowerCase();

    if (proteins.some(protein => ingredient.includes(protein))) return 'Proteins';
    if (vegetables.some(veg => ingredient.includes(veg))) return 'Vegetables';
    if (dairy.some(d => ingredient.includes(d))) return 'Dairy & Eggs';
    if (fats.some(fat => ingredient.includes(fat))) return 'Fats & Oils';
    if (herbs.some(herb => ingredient.includes(herb))) return 'Herbs & Spices';
    if (pantry.some(p => ingredient.includes(p))) return 'Pantry';
    
    return 'Other';
  };

  const toggleShoppingItem = (category, itemId) => {
    setShoppingList(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const totalDailyMacros = Object.values(mealsToDisplay).reduce((total, recipe) => {
    if (recipe) {
      const macros = getMacros(recipe);
      total.carbs += macros.carbs;
      total.protein += macros.protein;
      total.fat += macros.fat;
    }
    return total;
  }, { carbs: 0, protein: 0, fat: 0 });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Meal Planner</h1>
        <button className="p-2 text-lime-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Auto-generate Week Button */}
      <div className="mb-6">
        <button
          onClick={generateWeekMeals}
          className="w-full bg-lime-400 text-gray-900 p-3 rounded-lg font-medium hover:bg-lime-300 transition-colors"
        >
          Auto-Generate Next 7 Days 🧠
        </button>
      </div>

      {saveMessage && (
        <div className="mb-4 p-3 bg-lime-400 bg-opacity-20 border border-lime-400 rounded-lg">
          <p className="text-lime-400 text-sm">{saveMessage}</p>
        </div>
      )}

      {/* Calendar Slider */}
      <div className="mb-6">
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {weekDates.map((date, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg min-w-[60px] transition-colors ${
                isSelected(date)
                  ? 'bg-lime-400 text-gray-900'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <span className="text-sm font-medium">{getDayName(date)}</span>
              <span className="text-xl font-bold">{getDateNumber(date)}</span>
              {isToday(date) && (
                <div className="w-1 h-1 bg-current rounded-full mt-1"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Meals for Selected Day */}
      <div className="space-y-4 mb-6">
        {Object.entries(mealsToDisplay).map(([mealType, recipe]) => (
          <div key={mealType} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">{mealType}</h3>
                <p className="text-gray-400 text-sm">{getMealTime(mealType)}</p>
              </div>
            </div>
            
            {recipe ? (
              <div 
                className="flex items-center space-x-4 cursor-pointer"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{recipe.name}</h4>
                  <div className="flex space-x-4 text-sm text-gray-400 mt-1">
                    <span>{getMacros(recipe).carbs}g Carbs</span>
                    <span>{getMacros(recipe).protein}g Protein</span>
                    <span>{getMacros(recipe).fat}g Fat</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No meal planned</div>
            )}
          </div>
        ))}
      </div>

      {/* Daily Macros Summary */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Daily Macros
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalDailyMacros.carbs}g</div>
            <div className="text-gray-400 text-sm">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalDailyMacros.protein}g</div>
            <div className="text-gray-400 text-sm">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalDailyMacros.fat}g</div>
            <div className="text-gray-400 text-sm">Fat</div>
          </div>
        </div>
      </div>

      {/* Shopping List Button */}
      <button className="w-full bg-gray-800 text-white p-4 rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700 flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5m6 0L19 18H7" />
        </svg>
        <span>Shopping List</span>
      </button>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-gray-800 w-full max-w-md rounded-t-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedRecipe.name}</h3>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Recipe Tabs */}
              <div className="flex mt-4">
                <button
                  onClick={() => setActiveRecipeTab('ingredients')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg ${
                    activeRecipeTab === 'ingredients'
                      ? 'bg-lime-400 text-gray-900'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveRecipeTab('method')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg ${
                    activeRecipeTab === 'method'
                      ? 'bg-lime-400 text-gray-900'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Method
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {activeRecipeTab === 'ingredients' ? (
                <div className="space-y-2">
                  {selectedRecipe.ingredients.split(';').map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                      <span className="text-gray-300">{ingredient.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedRecipe.instructions.split('.').filter(step => step.trim()).map((step, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-lime-400 text-gray-900 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-gray-300">{step.trim()}.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanningPage;