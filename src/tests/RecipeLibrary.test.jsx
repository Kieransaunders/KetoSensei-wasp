import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as Sentry from '@sentry/react';
import RecipeLibraryPage from '../pages/RecipeLibrary';

// Mock Wasp operations
vi.mock('wasp/client/operations', () => ({
  useQuery: vi.fn(),
  useAction: vi.fn(),
  getRecipes: vi.fn(),
  addRecipeToFavorites: vi.fn(),
}));

// Mock Sentry
vi.mock('@sentry/react', () => ({
  startSpan: vi.fn((config, callback) => callback({ setAttribute: vi.fn() })),
  captureException: vi.fn(),
}));

describe('RecipeLibrary Favorites Functionality', () => {
  const mockRefetch = vi.fn();
  const mockAddToFavorites = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset Sentry mocks
    Sentry.startSpan.mockImplementation((config, callback) => 
      callback({ setAttribute: vi.fn() })
    );
    
    // Mock successful useQuery
    const { useQuery, useAction } = require('wasp/client/operations');
    useQuery.mockReturnValue({
      data: [
        { id: 1, name: 'Test Recipe', isFavorite: false },
        { id: 2, name: 'Another Recipe', isFavorite: true },
      ],
      isLoading: false,
      error: null,
      refetch: mockRefetch.mockResolvedValue({
        data: [
          { id: 1, name: 'Test Recipe', isFavorite: true },
          { id: 2, name: 'Another Recipe', isFavorite: true },
        ]
      }),
    });
    
    useAction.mockReturnValue(mockAddToFavorites.mockResolvedValue());
  });

  it('should track favorites operation with Sentry', async () => {
    render(<RecipeLibraryPage />);
    
    // Find and click a favorite button
    const favoriteButtons = screen.getAllByRole('button');
    const heartButton = favoriteButtons.find(btn => 
      btn.querySelector('svg')?.getAttribute('viewBox') === '0 0 24 24'
    );
    
    if (heartButton) {
      fireEvent.click(heartButton);
      
      await waitFor(() => {
        expect(Sentry.startSpan).toHaveBeenCalledWith(
          expect.objectContaining({
            op: 'ui.action',
            name: 'Toggle Recipe Favorite',
          }),
          expect.any(Function)
        );
      });
    }
  });

  it('should handle favorites error with proper Sentry tracking', async () => {
    // Mock API error
    mockAddToFavorites.mockRejectedValue(new Error('Network error'));
    
    render(<RecipeLibraryPage />);
    
    // Find and click a favorite button
    const favoriteButtons = screen.getAllByRole('button');
    const heartButton = favoriteButtons.find(btn => 
      btn.querySelector('svg')?.getAttribute('viewBox') === '0 0 24 24'
    );
    
    if (heartButton) {
      fireEvent.click(heartButton);
      
      await waitFor(() => {
        expect(Sentry.captureException).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            tags: {
              component: 'RecipeLibrary',
              action: 'toggleFavorite'
            }
          })
        );
      });
    }
  });

  it('should prevent multiple clicks on same recipe', async () => {
    render(<RecipeLibraryPage />);
    
    const favoriteButtons = screen.getAllByRole('button');
    const heartButton = favoriteButtons.find(btn => 
      btn.querySelector('svg')?.getAttribute('viewBox') === '0 0 24 24'
    );
    
    if (heartButton) {
      // Click multiple times rapidly
      fireEvent.click(heartButton);
      fireEvent.click(heartButton);
      fireEvent.click(heartButton);
      
      await waitFor(() => {
        // Should only be called once due to the isUpdatingFavorite guard
        expect(mockAddToFavorites).toHaveBeenCalledTimes(1);
      });
    }
  });

  it('should update UI state after successful favorite toggle', async () => {
    render(<RecipeLibraryPage />);
    
    const favoriteButtons = screen.getAllByRole('button');
    const heartButton = favoriteButtons.find(btn => 
      btn.querySelector('svg')?.getAttribute('viewBox') === '0 0 24 24'
    );
    
    if (heartButton) {
      fireEvent.click(heartButton);
      
      await waitFor(() => {
        expect(mockAddToFavorites).toHaveBeenCalled();
        expect(mockRefetch).toHaveBeenCalled();
      });
    }
  });

  it('should handle query errors with Sentry tracking', () => {
    const queryError = new Error('Query failed');
    
    const { useQuery } = require('wasp/client/operations');
    useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: queryError,
      refetch: mockRefetch,
    });

    render(<RecipeLibraryPage />);
    
    expect(Sentry.captureException).toHaveBeenCalledWith(
      queryError,
      expect.objectContaining({
        tags: {
          component: 'RecipeLibrary',
          action: 'loadRecipes'
        }
      })
    );
  });
});
