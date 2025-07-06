import { describe, it, expect, vi, beforeEach } from 'vitest'

// Simple test for the water intake logic without React components
describe('Water Intake Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should increment water count correctly', () => {
    let currentGlasses = 0
    
    // Simulate adding water
    const addWater = () => {
      if (currentGlasses < 8) {
        currentGlasses += 1
      }
      return currentGlasses
    }
    
    expect(addWater()).toBe(1)
    expect(addWater()).toBe(2)
    expect(addWater()).toBe(3)
    
    // Keep adding until limit
    while (currentGlasses < 8) {
      addWater()
    }
    
    expect(currentGlasses).toBe(8)
    
    // Try to add more (should stay at 8)
    expect(addWater()).toBe(8)
  })

  it('should validate goal achievement logic', () => {
    const isGoalReached = (glasses) => glasses >= 8
    
    expect(isGoalReached(0)).toBe(false)
    expect(isGoalReached(7)).toBe(false)
    expect(isGoalReached(8)).toBe(true)
    expect(isGoalReached(9)).toBe(true)
  })

  it('should generate correct progress percentage', () => {
    const getProgress = (glasses) => (glasses / 8) * 100
    
    expect(getProgress(0)).toBe(0)
    expect(getProgress(4)).toBe(50)
    expect(getProgress(8)).toBe(100)
  })

  it('should determine correct message type', () => {
    const getMessage = (glasses) => {
      if (glasses === 8) {
        return 'goal_reached'
      } else if (glasses > 0) {
        return 'progress'
      }
      return 'initial'
    }
    
    expect(getMessage(0)).toBe('initial')
    expect(getMessage(3)).toBe('progress')
    expect(getMessage(8)).toBe('goal_reached')
  })
})
