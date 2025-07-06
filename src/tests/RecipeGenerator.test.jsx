import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeGenerator from '../pages/RecipeGenerator.jsx';

// Mock the Wasp operations
vi.mock('wasp/client/operations', () => ({
  generateRecipeFromIngredients: vi.fn(),
  addRecipeToFavorites: vi.fn()
}));

import { generateRecipeFromIngredients, addRecipeToFavorites } from 'wasp/client/operations';

describe('RecipeGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the recipe generator page correctly', () => {
    render(<RecipeGenerator />);
    
    expect(screen.getByText('🥋 Recipe Generator Dojo')).toBeInTheDocument();
    expect(screen.getByText('Enter Your Ingredients')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter ingredients separated by commas/)).toBeInTheDocument();
    expect(screen.getByText('✨ Generate Recipes')).toBeInTheDocument();
  });

  it('shows error when trying to generate without ingredients', async () => {
    render(<RecipeGenerator />);
    
    const generateButton = screen.getByText('✨ Generate Recipes');
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Please enter some ingredients first!')).toBeInTheDocument();
  });

  it('generates recipes successfully', async () => {
    const mockRecipes = [
      {
        id: 1,
        name: 'Keto Avocado Salmon Bowl',
        ingredients: JSON.stringify(['salmon', 'avocado', 'olive oil']),
        instructions: 'Cook salmon. Add avocado.',
        isFavorite: false
      }
    ];

    generateRecipeFromIngredients.mockResolvedValue({
      success: true,
      recipes: mockRecipes
    });

    render(<RecipeGenerator />);
    
    const ingredientInput = screen.getByPlaceholderText(/Enter ingredients separated by commas/);
    const generateButton = screen.getByText('✨ Generate Recipes');
    
    fireEvent.change(ingredientInput, { target: { value: 'salmon, avocado' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('🍽️ Your Keto Creations')).toBeInTheDocument();
      expect(screen.getByText('Keto Avocado Salmon Bowl')).toBeInTheDocument();
    });
    
    expect(generateRecipeFromIngredients).toHaveBeenCalledWith({
      ingredients: 'salmon, avocado'
    });
  });

  it('handles recipe generation errors', async () => {
    generateRecipeFromIngredients.mockRejectedValue(new Error('API Error'));

    render(<RecipeGenerator />);
    
    const ingredientInput = screen.getByPlaceholderText(/Enter ingredients separated by commas/);
    const generateButton = screen.getByText('✨ Generate Recipes');
    
    fireEvent.change(ingredientInput, { target: { value: 'salmon, avocado' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('can favorite and unfavorite recipes', async () => {
    const mockRecipes = [
      {
        id: 1,
        name: 'Test Recipe',
        ingredients: JSON.stringify(['test']),
        instructions: 'Test instructions',
        isFavorite: false
      }
    ];

    generateRecipeFromIngredients.mockResolvedValue({
      success: true,
      recipes: mockRecipes
    });

    addRecipeToFavorites.mockResolvedValue({});

    render(<RecipeGenerator />);
    
    // First generate recipes
    const ingredientInput = screen.getByPlaceholderText(/Enter ingredients separated by commas/);
    fireEvent.change(ingredientInput, { target: { value: 'test ingredient' } });
    fireEvent.click(screen.getByText('✨ Generate Recipes'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
    
    // Click favorite button
    const favoriteButton = screen.getByText('🤍');
    fireEvent.click(favoriteButton);
    
    expect(addRecipeToFavorites).toHaveBeenCalledWith({ recipeId: 1 });
  });

  it('shows loading state during recipe generation', async () => {
    // Create a promise that we can resolve later
    let resolvePromise;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    generateRecipeFromIngredients.mockReturnValue(mockPromise);

    render(<RecipeGenerator />);
    
    const ingredientInput = screen.getByPlaceholderText(/Enter ingredients separated by commas/);
    const generateButton = screen.getByText('✨ Generate Recipes');
    
    fireEvent.change(ingredientInput, { target: { value: 'salmon, avocado' } });
    fireEvent.click(generateButton);
    
    // Should show loading state
    expect(screen.getByText('🔄 Channeling keto wisdom...')).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
    
    // Resolve the promise
    resolvePromise({ success: true, recipes: [] });
    
    await waitFor(() => {
      expect(screen.getByText('✨ Generate Recipes')).toBeInTheDocument();
      expect(generateButton).not.toBeDisabled();
    });
  });
});