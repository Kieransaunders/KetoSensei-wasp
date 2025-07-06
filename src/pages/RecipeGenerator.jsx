import React, { useState } from 'react';
import { generateRecipeFromIngredients, addRecipeToFavorites } from 'wasp/client/operations';

const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState('');
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateRecipes = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients first!');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await generateRecipeFromIngredients({ 
        ingredients: ingredients.trim() 
      });
      
      if (result.success) {
        setGeneratedRecipes(result.recipes);
        setError('');
      } else {
        setError('Failed to generate recipes. Please try again.');
      }
    } catch (err) {
      console.error('Recipe generation error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteRecipe = async (recipeId) => {
    try {
      await addRecipeToFavorites({ recipeId });
      // Update the local state to reflect the change
      setGeneratedRecipes(recipes => 
        recipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isFavorite: !recipe.isFavorite }
            : recipe
        )
      );
    } catch (err) {
      console.error('Error favoriting recipe:', err);
    }
  };

  const parseIngredients = (ingredientsString) => {
    try {
      return JSON.parse(ingredientsString);
    } catch {
      return ingredientsString.split('\n').filter(line => line.trim());
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🥋 Recipe Generator Dojo
          </h1>
          <p className="text-gray-300 text-lg">
            "Give me your ingredients, grasshopper, and I shall forge them into keto mastery."
          </p>
        </div>

        {/* Ingredient Input Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-lime-500">
          <h2 className="text-xl font-semibold text-lime-400 mb-4">
            🥗 Enter Your Ingredients
          </h2>
          
          <div className="mb-4">
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Enter ingredients separated by commas (e.g., salmon, avocado, spinach, olive oil)"
              className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-lime-500 focus:outline-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleGenerateRecipes}
            disabled={loading || !ingredients.trim()}
            className="w-full bg-lime-500 text-black font-semibold py-3 px-6 rounded-lg hover:bg-lime-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '🔄 Channeling keto wisdom...' : '✨ Generate Recipes'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Generated Recipes */}
        {generatedRecipes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-lime-400 mb-4">
              🍽️ Your Keto Creations
            </h2>
            
            {generatedRecipes.map((recipe, index) => (
              <div key={recipe.id} className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {recipe.name}
                  </h3>
                  <button
                    onClick={() => handleFavoriteRecipe(recipe.id)}
                    className={`p-2 rounded-full transition-colors ${
                      recipe.isFavorite 
                        ? 'text-red-500 hover:text-red-400' 
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    {recipe.isFavorite ? '❤️' : '🤍'}
                  </button>
                </div>

                {/* Recipe metadata */}
                {(recipe.prepTime || recipe.servings || recipe.netCarbs) && (
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-300">
                    {recipe.prepTime && (
                      <span className="bg-gray-700 px-2 py-1 rounded">
                        ⏱️ {recipe.prepTime}
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="bg-gray-700 px-2 py-1 rounded">
                        👥 {recipe.servings} servings
                      </span>
                    )}
                    {recipe.netCarbs && (
                      <span className="bg-green-700 px-2 py-1 rounded">
                        🥬 {recipe.netCarbs}
                      </span>
                    )}
                  </div>
                )}

                {/* Ingredients */}
                <div className="mb-4">
                  <h4 className="font-semibold text-lime-400 mb-2">Ingredients:</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {parseIngredients(recipe.ingredients).map((ingredient, idx) => (
                      <li key={idx}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold text-lime-400 mb-2">Instructions:</h4>
                  <div className="text-gray-300 whitespace-pre-line">
                    {recipe.instructions}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {generatedRecipes.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🥋</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Ready to Create Keto Magic?
            </h3>
            <p className="text-gray-500">
              Enter your ingredients above and let KetoSensei craft perfect recipes for you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGenerator;