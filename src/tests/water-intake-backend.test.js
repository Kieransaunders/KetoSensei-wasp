import { describe, it, beforeEach, expect, vi } from 'vitest'
import { addWaterGlass } from '../actions.js'
import { getTodaysWater as getTodaysWaterQuery } from '../queries.js'

// Mock context for testing
const createMockContext = (userId = 1) => ({
  user: { id: userId },
  entities: {
    WaterIntake: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    }
  }
})

describe('Water Intake Backend Tests', () => {
  let mockContext

  beforeEach(() => {
    mockContext = createMockContext()
    vi.clearAllMocks()
  })

  describe('addWaterGlass', () => {
    it('should create new water intake record for first glass of the day', async () => {
      // Mock no existing record
      mockContext.entities.WaterIntake.findUnique.mockResolvedValue(null)
      
      // Mock successful creation
      const mockNewRecord = { 
        id: 1, 
        userId: 1, 
        glasses: 1, 
        date: new Date() 
      }
      mockContext.entities.WaterIntake.create.mockResolvedValue(mockNewRecord)

      const result = await addWaterGlass({}, mockContext)

      expect(mockContext.entities.WaterIntake.findUnique).toHaveBeenCalledWith({
        where: { 
          userId_date: { 
            userId: 1, 
            date: expect.any(Date)
          } 
        }
      })

      expect(mockContext.entities.WaterIntake.create).toHaveBeenCalledWith({
        data: { 
          userId: 1, 
          glasses: 1,
          date: expect.any(Date)
        }
      })

      expect(result).toEqual(mockNewRecord)
    })

    it('should increment glasses count when record exists', async () => {
      // Mock existing record with 3 glasses
      const mockExistingRecord = { 
        id: 1, 
        userId: 1, 
        glasses: 3, 
        date: new Date() 
      }
      mockContext.entities.WaterIntake.findUnique.mockResolvedValue(mockExistingRecord)
      
      // Mock successful update
      const mockUpdatedRecord = { 
        ...mockExistingRecord, 
        glasses: 4 
      }
      mockContext.entities.WaterIntake.update.mockResolvedValue(mockUpdatedRecord)

      const result = await addWaterGlass({}, mockContext)

      expect(mockContext.entities.WaterIntake.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { glasses: 4 }
      })

      expect(result).toEqual(mockUpdatedRecord)
    })

    it('should not exceed 8 glasses per day', async () => {
      // Mock existing record with 8 glasses
      const mockExistingRecord = { 
        id: 1, 
        userId: 1, 
        glasses: 8, 
        date: new Date() 
      }
      mockContext.entities.WaterIntake.findUnique.mockResolvedValue(mockExistingRecord)
      
      // Mock successful update (should stay at 8)
      const mockUpdatedRecord = { 
        ...mockExistingRecord, 
        glasses: 8 
      }
      mockContext.entities.WaterIntake.update.mockResolvedValue(mockUpdatedRecord)

      const result = await addWaterGlass({}, mockContext)

      expect(mockContext.entities.WaterIntake.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { glasses: 8 } // Should remain 8, not increment to 9
      })

      expect(result.glasses).toBe(8)
    })

    it('should throw error when user is not authenticated', async () => {
      const unauthenticatedContext = { user: null, entities: {} }

      await expect(addWaterGlass({}, unauthenticatedContext))
        .rejects
        .toThrow('401')
    })
  })

  describe('getTodaysWater', () => {
    it('should return existing water record for today', async () => {
      const mockRecord = { 
        id: 1, 
        userId: 1, 
        glasses: 5, 
        date: new Date() 
      }
      mockContext.entities.WaterIntake.findUnique.mockResolvedValue(mockRecord)

      const result = await getTodaysWaterQuery({}, mockContext)

      expect(mockContext.entities.WaterIntake.findUnique).toHaveBeenCalledWith({
        where: { 
          userId_date: { 
            userId: 1, 
            date: expect.any(Date)
          } 
        }
      })

      expect(result).toEqual(mockRecord)
    })

    it('should return default values when no record exists for today', async () => {
      mockContext.entities.WaterIntake.findUnique.mockResolvedValue(null)

      const result = await getTodaysWaterQuery({}, mockContext)

      expect(result).toEqual({ 
        glasses: 0, 
        date: expect.any(Date) 
      })
    })

    it('should throw error when user is not authenticated', async () => {
      const unauthenticatedContext = { user: null, entities: {} }

      await expect(getTodaysWaterQuery({}, unauthenticatedContext))
        .rejects
        .toThrow('401')
    })
  })
})
