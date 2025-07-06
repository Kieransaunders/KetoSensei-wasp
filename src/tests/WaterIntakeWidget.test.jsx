import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WaterIntakeWidget from '../components/WaterIntakeWidget';

// Mock the wasp client operations
vi.mock('wasp/client/operations', () => ({
  useQuery: vi.fn(),
  useAction: vi.fn(),
  getTodaysWater: 'getTodaysWater',
  addWaterGlass: 'addWaterGlass'
}));

import { useQuery, useAction } from 'wasp/client/operations';

describe('WaterIntakeWidget', () => {
  let mockRefetch;
  let mockAddWaterGlass;
  let mockOnMessage;

  beforeEach(() => {
    mockRefetch = vi.fn();
    mockAddWaterGlass = vi.fn();
    mockOnMessage = vi.fn();
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders initial state with 0 glasses', () => {
    useQuery.mockReturnValue({
      data: { glasses: 0 },
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    
    useAction.mockReturnValue(mockAddWaterGlass);

    render(<WaterIntakeWidget onMessage={mockOnMessage} />);

    expect(screen.getByTestId('water-count')).toHaveTextContent('0/8 glasses');
    expect(screen.getByTestId('add-water-button')).toHaveTextContent('Add Water');
    expect(screen.getByTestId('add-water-button')).not.toBeDisabled();
  });

  it('shows loading state', () => {
    useQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch
    });
    
    useAction.mockReturnValue(mockAddWaterGlass);

    render(<WaterIntakeWidget onMessage={mockOnMessage} />);

    expect(screen.getByText('Loading water data...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Database error'),
      refetch: mockRefetch
    });
    
    useAction.mockReturnValue(mockAddWaterGlass);

    render(<WaterIntakeWidget onMessage={mockOnMessage} />);

    expect(screen.getByText('Error loading water data')).toBeInTheDocument();
  });

  it('handles adding water successfully', async () => {
    useQuery.mockReturnValue({
      data: { glasses: 3 },
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    
    mockAddWaterGlass.mockResolvedValue({ glasses: 4 });
    useAction.mockReturnValue(mockAddWaterGlass);

    render(<WaterIntakeWidget onMessage={mockOnMessage} />);

    const addButton = screen.getByTestId('add-water-button');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddWaterGlass).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
      expect(mockOnMessage).toHaveBeenCalledWith(
        expect.stringContaining('hydration')
      );
    });
  });

  it('shows goal achieved state when 8 glasses reached', () => {
    useQuery.mockReturnValue({
      data: { glasses: 8 },
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    
    useAction.mockReturnValue(mockAddWaterGlass);

    render(<WaterIntakeWidget onMessage={mockOnMessage} />);

    expect(screen.getByTestId('water-count')).toHaveTextContent('8/8 glasses');
    expect(screen.getByText('Daily goal achieved! 🎉')).toBeInTheDocument();
    expect(screen.getByTestId('add-water-button')).toHaveTextContent('Goal Reached!');
    expect(screen.getByTestId('add-water-button')).toBeDisabled();
  });

  it('shows special message when goal is reached', async () => {
    useQuery.mockReturnValue({
      data: { glasses: 7 },
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    
    mockAddWaterGlass.mockResolvedValue({ glasses: 8 });
    useAction.mockReturnValue(mockAddWaterGlass);

    render(<WaterIntakeWidget onMessage={mockOnMessage} />);

    const addButton = screen.getByTestId('add-water-button');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnMessage).toHaveBeenCalledWith(
        expect.stringContaining('Outstanding hydration mastery')
      );
    });
  });

  it('handles API errors gracefully', async () => {
    useQuery.mockReturnValue({
      data: { glasses: 3 },
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    
    mockAddWaterGlass.mockRejectedValue(new Error('API Error'));
    useAction.mockReturnValue(mockAddWaterGlass);

    render(<WaterIntakeWidget onMessage={mockOnMessage} />);

    const addButton = screen.getByTestId('add-water-button');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnMessage).toHaveBeenCalledWith(
        expect.stringContaining('water spirits are temporarily unavailable')
      );
    });
  });

  it('displays correct progress bar width', () => {
    useQuery.mockReturnValue({
      data: { glasses: 4 },
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    
    useAction.mockReturnValue(mockAddWaterGlass);

    render(<WaterIntakeWidget onMessage={mockOnMessage} />);

    const progressBar = screen.getByRole('progressbar') || 
                       document.querySelector('.bg-blue-400');
    
    expect(progressBar).toHaveStyle('width: 50%'); // 4/8 = 50%
  });
});
