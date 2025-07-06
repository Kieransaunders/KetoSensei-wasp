import React, { useState } from 'react';
import { useQuery, useAction, getRecipes, addRecipeToFavorites } from 'wasp/client/operations';
import * as Sentry from '@sentry/react';

const RecipeLibraryPage = () => {
  // Track recipe loading performance
  const { data: recipes, isLoading, error, refetch: refetchRecipes } = useQuery(getRecipes, undefined, {
    onError: (error) => {
      Sentry.captureException(error, {
        tags: {
          component: 'RecipeLibrary',
          action: 'loadRecipes'
        }
      });
    }
  });
  const addRecipeToFavoritesFn = useAction(addRecipeToFavorites);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [favoriteRecipes, setFavoriteRecipes] = useState(new Set([1])); // Mock favorites with recipe 1 initially favorited
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(null); // Track which recipe is being updated

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-white text-lg">Loading recipes...</div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 bg-red-900 border border-red-700 rounded-lg">
      <div className="text-red-200">Error loading recipes: {error}</div>
    </div>
  );

  const handleAddToFavorites = async (recipeId) => {
    // Prevent multiple clicks on same recipe
    if (isUpdatingFavorite === recipeId) return;
    
    setIsUpdatingFavorite(recipeId);
    
    // Create a performance span for monitoring
    return Sentry.startSpan(
      {
        op: "ui.action",
        name: "Toggle Recipe Favorite",
      },
      async (span) => {
        span.setAttribute("recipe.id", recipeId);
        span.setAttribute("recipe.name", selectedRecipe?.name || "Unknown");
        
        try {
          // For real database recipes
          if (recipes && recipes.length > 0 && recipes.find(r => r.id === recipeId)) {
            span.setAttribute("favorite.type", "database");
            
            // Call the API to toggle favorite status in database
            await Sentry.startSpan(
              { op: "db.mutation", name: "Update Recipe Favorite" },
              () => addRecipeToFavoritesFn({ recipeId })
            );
            
            // Wait for the refetch to complete to ensure UI consistency
            const { data: updatedRecipes } = await Sentry.startSpan(
              { op: "db.query", name: "Refetch Recipes" },
              () => refetchRecipes()
            );
            
            // Update selected recipe with fresh data from the refetch result
            if (selectedRecipe && selectedRecipe.id === recipeId) {
              const updatedRecipe = updatedRecipes?.find(r => r.id === recipeId);
              if (updatedRecipe) {
                setSelectedRecipe({
                  ...selectedRecipe,
                  isFavorite: updatedRecipe.isFavorite
                });
                span.setAttribute("favorite.new_status", updatedRecipe.isFavorite);
              }
            }
          } else {
            // For mock recipes, update local state only
            span.setAttribute("favorite.type", "mock");
            
            setFavoriteRecipes(prev => {
              const newFavorites = new Set(prev);
              const newStatus = !newFavorites.has(recipeId);
              if (newFavorites.has(recipeId)) {
                newFavorites.delete(recipeId);
              } else {
                newFavorites.add(recipeId);
              }
              span.setAttribute("favorite.new_status", newStatus);
              return newFavorites;
            });
            
            // Update selected recipe for mock data
            if (selectedRecipe && selectedRecipe.id === recipeId) {
              setSelectedRecipe(prev => ({
                ...prev,
                isFavorite: !prev.isFavorite
              }));
            }
          }
        } catch (error) {
          // Track the error with Sentry
          Sentry.captureException(error, {
            tags: {
              component: 'RecipeLibrary',
              action: 'toggleFavorite'
            },
            extra: {
              recipeId,
              recipeName: selectedRecipe?.name || 'Unknown',
              hasRecipes: Boolean(recipes && recipes.length > 0)
            }
          });
          
          console.error('Failed to update favorite status:', error);
          
          // Show user-friendly error message
          // You could also add a toast notification here
          alert('Failed to update favorite. Please try again.');
          
          // Fallback: update local state for mock data
          setFavoriteRecipes(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(recipeId)) {
              newFavorites.delete(recipeId);
            } else {
              newFavorites.add(recipeId);
            }
            return newFavorites;
          });
          
          if (selectedRecipe && selectedRecipe.id === recipeId) {
            setSelectedRecipe(prev => ({
              ...prev,
              isFavorite: !prev.isFavorite
            }));
          }
        } finally {
          setIsUpdatingFavorite(null);
        }
      }
    );
  };

  // Mock data for demonstration since we don't have real recipe images/data
  const mockRecipes = [
    {
      id: 1,
      name: 'Keto Chicken Alfredo',
      time: '30 min',
      servings: 4,
      difficulty: 'Easy',
      carbs: '4g',
      isFavorite: favoriteRecipes.has(1),
      image: '/api/placeholder/300/200',
      protein: '35g',
      fat: '28g',
      totalCarbs: '5g',
      description: 'Creamy, delicious keto-friendly chicken alfredo with zucchini noodles.',
      tags: ['Keto', 'Low-Carb', 'High-Protein', 'Gluten-Free'],
      category: 'Quick & Easy',
      ingredients: [
        '2 lbs chicken breast, diced',
        '4 medium zucchini, spiralized',
        '1 cup heavy cream',
        '1/2 cup parmesan cheese, grated',
        '4 cloves garlic, minced',
        '3 tbsp butter',
        'Salt and pepper to taste',
        '1 tsp Italian seasoning'
      ],
      method: [
        'Season chicken with salt, pepper, and Italian seasoning.',
        'Heat butter in a large skillet over medium-high heat.',
        'Add chicken and cook until golden brown, about 6-8 minutes.',
        'Add garlic and cook for 1 minute until fragrant.',
        'Pour in heavy cream and bring to a simmer.',
        'Add parmesan cheese and stir until melted.',
        'Add zucchini noodles and toss for 2-3 minutes.',
        'Serve immediately with extra parmesan if desired.'
      ]
    },
    {
      id: 2,
      name: 'Cauliflower Mac & Cheese',
      time: '45 min',
      servings: 6,
      difficulty: 'Medium',
      carbs: '6g',
      isFavorite: favoriteRecipes.has(2),
      image: '/api/placeholder/300/200',
      protein: '15g',
      fat: '22g',
      totalCarbs: '8g',
      description: 'Comfort food made keto with cauliflower and rich cheese sauce.',
      tags: ['Keto', 'Vegetarian', 'Comfort Food'],
      category: 'Family Favorites',
      ingredients: [
        '1 large head cauliflower, cut into florets',
        '2 cups sharp cheddar cheese, shredded',
        '1/2 cup cream cheese, softened',
        '1/2 cup heavy cream',
        '1/4 cup butter',
        '2 cloves garlic, minced',
        '1 tsp mustard powder',
        'Salt and pepper to taste'
      ],
      method: [
        'Preheat oven to 375°F (190°C).',
        'Steam cauliflower florets until tender, about 10 minutes.',
        'In a saucepan, melt butter and sauté garlic for 1 minute.',
        'Add cream cheese and heavy cream, whisk until smooth.',
        'Add cheddar cheese and mustard powder, stir until melted.',
        'Season with salt and pepper.',
        'Combine cauliflower with cheese sauce in a baking dish.',
        'Bake for 20-25 minutes until bubbly and golden.'
      ]
    },
    {
      id: 3,
      name: 'Keto Chicken Parmesan',
      time: '30 min',
      servings: 4,
      difficulty: 'Easy',
      carbs: '3.5g',
      isFavorite: favoriteRecipes.has(3),
      image: '/api/placeholder/300/200',
      protein: '35g',
      fat: '28g',
      totalCarbs: '5g',
      description: 'Crispy chicken parmesan with a keto-friendly almond flour coating.',
      tags: ['Keto', 'Low-Carb', 'High-Protein', 'Gluten-Free'],
      category: 'All',
      ingredients: [
        '4 chicken breasts, pounded thin',
        '1 cup almond flour',
        '1/2 cup parmesan cheese, grated',
        '2 eggs, beaten',
        '1 cup marinara sauce (sugar-free)',
        '1 cup mozzarella cheese, shredded',
        '2 tsp Italian seasoning',
        '1 tsp garlic powder',
        'Salt and pepper to taste',
        '2 tbsp olive oil'
      ],
      method: [
        'Preheat oven to 400°F (200°C).',
        'Mix almond flour, parmesan, Italian seasoning, garlic powder, salt, and pepper.',
        'Dip chicken in beaten eggs, then coat with almond flour mixture.',
        'Heat olive oil in an oven-safe skillet over medium-high heat.',
        'Sear chicken until golden, about 3-4 minutes per side.',
        'Top each chicken breast with marinara sauce and mozzarella.',
        'Transfer skillet to oven and bake for 15-20 minutes.',
        'Let rest for 5 minutes before serving.'
      ]
    }
  ];

  const filterTabs = ['All', 'Quick & Easy', 'Family Favorites', 'Vegetarian'];

  // Use real recipes if available, otherwise use mock recipes
  const recipesToDisplay = recipes && recipes.length > 0 ? recipes : mockRecipes;
  
  const filteredRecipes = activeFilter === 'All' 
    ? recipesToDisplay 
    : recipesToDisplay.filter(recipe => {
        // For real recipes, filter by type instead of category
        if (recipe.type) {
          return recipe.type.toLowerCase().includes(activeFilter.toLowerCase());
        }
        // For mock recipes, use category
        return recipe.category === activeFilter;
      });

  if (selectedRecipe) {
    return (
      <div className="max-w-md mx-auto bg-gray-900 min-h-screen relative">
        {/* Header Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between z-10">
          <button 
            onClick={() => setSelectedRecipe(null)}
            className="w-12 h-12 bg-gray-800 bg-opacity-80 rounded-full flex items-center justify-center text-white hover:bg-opacity-100 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => handleAddToFavorites(selectedRecipe.id)}
            disabled={isUpdatingFavorite === selectedRecipe.id}
            className={`w-12 h-12 bg-gray-800 bg-opacity-80 rounded-full flex items-center justify-center transition-all ${
              isUpdatingFavorite === selectedRecipe.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-100'
            }`}
          >
            {isUpdatingFavorite === selectedRecipe.id ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className={`w-6 h-6 ${selectedRecipe.isFavorite || favoriteRecipes.has(selectedRecipe.id) ? 'text-red-500 fill-current' : 'text-white'}`} fill={selectedRecipe.isFavorite || favoriteRecipes.has(selectedRecipe.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col justify-center min-h-screen px-6 py-20">
          {/* Recipe Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-6">{selectedRecipe.name}</h1>
            <div className="flex items-center justify-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg">{selectedRecipe.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-lg">{selectedRecipe.servings} servings</span>
              </div>
            </div>
          </div>

          {/* Nutrition Card */}
          <div className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{selectedRecipe.carbs} Net Carbs</h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">Protein</div>
                <div className="text-white font-bold text-2xl mb-3">{selectedRecipe.protein}</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">Fat</div>
                <div className="text-white font-bold text-2xl mb-3">{selectedRecipe.fat}</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">Total</div>
                <div className="text-white font-bold text-2xl mb-3">{selectedRecipe.totalCarbs}</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Cooking Button */}
          <button className="w-full bg-lime-400 text-gray-900 p-4 rounded-xl font-bold text-lg mb-8 hover:bg-lime-300 transition-colors">
            Start Cooking
          </button>

          {/* Recipe Tabs */}
          <div className="mb-8">
            {/* Tab Navigation */}
            <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'ingredients'
                    ? 'bg-lime-400 text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Ingredients
              </button>
              <button
                onClick={() => setActiveTab('method')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'method'
                    ? 'bg-lime-400 text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Method
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              {activeTab === 'ingredients' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Ingredients</h3>
                  <ul className="space-y-3">
                    {(() => {
                      // Safe ingredients handling - prevents .map crashes
                      let ingredients = [];
                      
                      if (Array.isArray(selectedRecipe.ingredients)) {
                        ingredients = selectedRecipe.ingredients;
                      } else if (typeof selectedRecipe.ingredients === 'string' && selectedRecipe.ingredients) {
                        ingredients = selectedRecipe.ingredients.split(';').map(ingredient => ingredient.trim()).filter(Boolean);
                      } else if (selectedRecipe.ingredients) {
                        // Handle other data types gracefully
                        ingredients = [String(selectedRecipe.ingredients)];
                      }
                      
                      return ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-300">{ingredient}</span>
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              )}

              {activeTab === 'method' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Method</h3>
                  <ol className="space-y-4">
                    {(() => {
                      // Safe method/instructions handling
                      let steps = [];
                      
                      if (Array.isArray(selectedRecipe.method)) {
                        steps = selectedRecipe.method;
                      } else if (Array.isArray(selectedRecipe.instructions)) {
                        steps = selectedRecipe.instructions;
                      } else if (typeof selectedRecipe.method === 'string' && selectedRecipe.method) {
                        steps = selectedRecipe.method.split('.').map(step => step.trim()).filter(Boolean).map(step => step + '.');
                      } else if (typeof selectedRecipe.instructions === 'string' && selectedRecipe.instructions) {
                        steps = selectedRecipe.instructions.split('.').map(step => step.trim()).filter(Boolean).map(step => step + '.');
                      } else if (selectedRecipe.method || selectedRecipe.instructions) {
                        steps = [String(selectedRecipe.method || selectedRecipe.instructions)];
                      }
                      
                      return steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-lime-400 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-gray-300 leading-relaxed">{step}</span>
                        </li>
                      ));
                    })()}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {selectedRecipe.tags.map((tag) => (
                <span key={tag} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Icons */}
          <div className="flex justify-center space-x-12">
            <button className="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
            </button>
            <button className="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
            </button>
            <button className="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v6a2 2 0 002 2h2m2-2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2h-6m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2h-6" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Recipe Library</h1>
          <div className="flex space-x-2">
            <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center">
              <span className="text-gray-900 font-bold">🔍</span>
            </div>
            <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center">
              <span className="text-gray-900 font-bold">⚙️</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {filterTabs.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-lime-400 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards */}
      <div className="p-6 space-y-4">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => {
              setSelectedRecipe(recipe);
              setActiveTab('ingredients');
            }}
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
          >
            <div className="relative">
              <img 
                src={recipe.image} 
                alt={recipe.name}
                className="w-full h-48 object-cover"
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToFavorites(recipe.id);
                }}
                disabled={isUpdatingFavorite === recipe.id}
                className={`absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center ${
                  isUpdatingFavorite === recipe.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-70'
                }`}
              >
                {isUpdatingFavorite === recipe.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className={`w-5 h-5 ${recipe.isFavorite || favoriteRecipes.has(recipe.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} fill={recipe.isFavorite || favoriteRecipes.has(recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2">{recipe.name}</h3>
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <div className="flex items-center space-x-1">
                  <span>⏱️</span>
                  <span>{recipe.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🍽️</span>
                  <span>{recipe.servings}g</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📊</span>
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredRecipes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl mb-4 block">🍽️</span>
            <p>No recipes found for "{activeFilter}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeLibraryPage;
