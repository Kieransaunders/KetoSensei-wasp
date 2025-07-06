import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DashboardPage from '../pages/Dashboard.jsx';

// Mock Wasp client operations
const mockUseQuery = vi.fn();
const mockUseAction = vi.fn();

vi.mock('wasp/client/operations', () => ({
  useQuery: mockUseQuery,
  useAction: mockUseAction,
  getStreaks: 'getStreaks',
  trackStreak: 'trackStreak',
  getTodaysTip: 'getTodaysTip'
}));

describe('Daily Tips System Complete', () => {
  const mockTrackStreakFn = vi.fn();
  const mockRefetchStreaks = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAction.mockReturnValue(mockTrackStreakFn);
  });

  describe('Daily Tip Display', () => {
    it('should display today\'s tip when available', () => {
      const mockTip = {
        title: 'Master Your Macros',
        content: 'Focus on your fat intake to stay in ketosis',
        category: 'Nutrition'
      };

      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: mockTip, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: [], isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      render(<DashboardPage />);

      expect(screen.getByText('Master Your Macros')).toBeInTheDocument();
      expect(screen.getByText('"Focus on your fat intake to stay in ketosis"')).toBeInTheDocument();
      expect(screen.getByText('Nutrition')).toBeInTheDocument();
    });

    it('should display default tip when no tip is available', () => {
      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: null, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: [], isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      render(<DashboardPage />);

      expect(screen.getByText('Today\'s Wisdom')).toBeInTheDocument();
      expect(screen.getByText('"Discipline your cravings. Master your metabolism, grasshopper."')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: null, isLoading: true, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: null, isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      render(<DashboardPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show error state for tip loading', () => {
      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: null, isLoading: false, error: 'Failed to load tip' };
        }
        if (operation === 'getStreaks') {
          return { data: [], isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      render(<DashboardPage />);

      expect(screen.getByText('Error loading tip: Failed to load tip')).toBeInTheDocument();
    });
  });

  describe('Streak Tracking', () => {
    it('should allow tracking daily tip when not checked in today', async () => {
      const mockTip = {
        title: 'Test Tip',
        content: 'Test content',
        category: 'Test'
      };

      const mockStreaks = [
        {
          type: 'dailyTip',
          currentStreak: 5,
          maxStreak: 10,
          lastCheckIn: '2024-01-01T00:00:00Z' // Different day
        }
      ];

      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: mockTip, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: mockStreaks, isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      mockTrackStreakFn.mockResolvedValue({
        message: 'Streak tracked successfully!',
        alreadyCheckedIn: false
      });

      render(<DashboardPage />);

      const trackButton = screen.getByText('Master This Wisdom 🏆');
      expect(trackButton).toBeEnabled();

      fireEvent.click(trackButton);

      await waitFor(() => {
        expect(mockTrackStreakFn).toHaveBeenCalledWith({ type: 'dailyTip' });
      });
    });

    it('should disable tracking when already checked in today', () => {
      const mockTip = {
        title: 'Test Tip',
        content: 'Test content',
        category: 'Test'
      };

      const today = new Date().toISOString();
      const mockStreaks = [
        {
          type: 'dailyTip',
          currentStreak: 5,
          maxStreak: 10,
          lastCheckIn: today // Same day
        }
      ];

      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: mockTip, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: mockStreaks, isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      render(<DashboardPage />);

      const trackButton = screen.getByText('✅ Wisdom Mastered Today');
      expect(trackButton).toBeDisabled();
    });

    it('should display sensei message after tracking', async () => {
      const mockTip = {
        title: 'Test Tip',
        content: 'Test content',
        category: 'Test'
      };

      const mockStreaks = [
        {
          type: 'dailyTip',
          currentStreak: 5,
          maxStreak: 10,
          lastCheckIn: '2024-01-01T00:00:00Z'
        }
      ];

      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: mockTip, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: mockStreaks, isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      mockTrackStreakFn.mockResolvedValue({
        message: 'Excellent! Your wisdom grows stronger, grasshopper.',
        alreadyCheckedIn: false
      });

      render(<DashboardPage />);

      const trackButton = screen.getByText('Master This Wisdom 🏆');
      fireEvent.click(trackButton);

      await waitFor(() => {
        expect(screen.getByText('Sensei Speaks:')).toBeInTheDocument();
        expect(screen.getByText('Excellent! Your wisdom grows stronger, grasshopper.')).toBeInTheDocument();
      });
    });

    it('should handle tracking errors gracefully', async () => {
      const mockTip = {
        title: 'Test Tip',
        content: 'Test content',
        category: 'Test'
      };

      const mockStreaks = [
        {
          type: 'dailyTip',
          currentStreak: 5,
          maxStreak: 10,
          lastCheckIn: '2024-01-01T00:00:00Z'
        }
      ];

      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: mockTip, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: mockStreaks, isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      mockTrackStreakFn.mockRejectedValue(new Error('Network error'));

      render(<DashboardPage />);

      const trackButton = screen.getByText('Master This Wisdom 🏆');
      fireEvent.click(trackButton);

      await waitFor(() => {
        expect(screen.getByText('The sensei is temporarily unavailable. Please try again, grasshopper.')).toBeInTheDocument();
      });
    });
  });

  describe('Belt System', () => {
    it('should display correct belt for different streak levels', () => {
      const testCases = [
        { streak: 0, expectedBelt: '🥋 NOVICE' },
        { streak: 3, expectedBelt: '⚪ WHITE BELT' },
        { streak: 7, expectedBelt: '🟡 YELLOW BELT' },
        { streak: 21, expectedBelt: '🟠 ORANGE BELT' },
        { streak: 45, expectedBelt: '🟢 GREEN BELT' },
        { streak: 90, expectedBelt: '🔵 BLUE BELT' },
        { streak: 180, expectedBelt: '🟫 BROWN BELT' },
        { streak: 365, expectedBelt: '🥋 BLACK BELT' }
      ];

      testCases.forEach(({ streak, expectedBelt }) => {
        const mockStreaks = [
          {
            type: 'dailyTip',
            currentStreak: streak,
            maxStreak: streak,
            lastCheckIn: '2024-01-01T00:00:00Z'
          }
        ];

        mockUseQuery.mockImplementation((operation) => {
          if (operation === 'getTodaysTip') {
            return { data: null, isLoading: false, error: null };
          }
          if (operation === 'getStreaks') {
            return { data: mockStreaks, isLoading: false, error: null, refetch: mockRefetchStreaks };
          }
        });

        const { unmount } = render(<DashboardPage />);
        
        expect(screen.getByText(expectedBelt)).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should display streak statistics correctly', () => {
      const mockStreaks = [
        {
          type: 'dailyTip',
          currentStreak: 15,
          maxStreak: 25,
          lastCheckIn: '2024-01-01T00:00:00Z'
        }
      ];

      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: null, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: mockStreaks, isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      render(<DashboardPage />);

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Current Streak')).toBeInTheDocument();
      expect(screen.getByText('Best Streak: 25 days')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no streaks exist', () => {
      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: null, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: [], isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      render(<DashboardPage />);

      expect(screen.getByText('Your martial arts journey awaits! Master today\'s wisdom to begin your first streak.')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should refetch streaks after successful tracking', async () => {
      const mockTip = {
        title: 'Test Tip',
        content: 'Test content',
        category: 'Test'
      };

      const mockStreaks = [
        {
          type: 'dailyTip',
          currentStreak: 5,
          maxStreak: 10,
          lastCheckIn: '2024-01-01T00:00:00Z'
        }
      ];

      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: mockTip, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: mockStreaks, isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      mockTrackStreakFn.mockResolvedValue({
        message: 'Success!',
        alreadyCheckedIn: false
      });

      render(<DashboardPage />);

      const trackButton = screen.getByText('Master This Wisdom 🏆');
      fireEvent.click(trackButton);

      await waitFor(() => {
        expect(mockRefetchStreaks).toHaveBeenCalled();
      });
    });

    it('should not refetch streaks if already checked in', async () => {
      const mockTip = {
        title: 'Test Tip',
        content: 'Test content',
        category: 'Test'
      };

      const mockStreaks = [
        {
          type: 'dailyTip',
          currentStreak: 5,
          maxStreak: 10,
          lastCheckIn: '2024-01-01T00:00:00Z'
        }
      ];

      mockUseQuery.mockImplementation((operation) => {
        if (operation === 'getTodaysTip') {
          return { data: mockTip, isLoading: false, error: null };
        }
        if (operation === 'getStreaks') {
          return { data: mockStreaks, isLoading: false, error: null, refetch: mockRefetchStreaks };
        }
      });

      mockTrackStreakFn.mockResolvedValue({
        message: 'Already checked in!',
        alreadyCheckedIn: true
      });

      render(<DashboardPage />);

      const trackButton = screen.getByText('Master This Wisdom 🏆');
      fireEvent.click(trackButton);

      await waitFor(() => {
        expect(mockRefetchStreaks).not.toHaveBeenCalled();
      });
    });
  });
});
