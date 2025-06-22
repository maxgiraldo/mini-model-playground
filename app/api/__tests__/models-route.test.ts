import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '../models/route'
import { ModelsService } from '@/app/lib/models/models-service'
import { ConsoleLogger, NoOpLogger } from '@/app/lib/logger'

// Mock the ModelsService
vi.mock('@/app/lib/models/models-service')
vi.mock('@/app/lib/logger')

const mockModelsService = {
  getModels: vi.fn(),
}

const mockConsoleLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
}

const mockNoOpLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
}

describe('Models API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock the logger classes
    vi.mocked(ConsoleLogger).mockImplementation(() => mockConsoleLogger)
    vi.mocked(NoOpLogger).mockImplementation(() => mockNoOpLogger)
    
    // Mock the ModelsService constructor
    vi.mocked(ModelsService).mockImplementation(() => mockModelsService as any)
  })

  describe('GET /api/models', () => {
    it('should return models for successful request', async () => {
      // Arrange
      const mockModels = [
        {
          name: 'accounts/fireworks/models/qwen3-30b-a3b',
          title: 'Qwen 3 30B A3B',
          description: 'A powerful language model'
        },
        {
          name: 'accounts/fireworks/models/llama-v3-8b-instruct',
          title: 'Llama v3 8B Instruct',
          description: 'An instruction-tuned model'
        }
      ]
      
      mockModelsService.getModels.mockResolvedValue(mockModels)

      // Act
      const response = await GET()
      const responseBody = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseBody).toEqual(mockModels)
      expect(mockModelsService.getModels).toHaveBeenCalled()
    })

    it('should return 500 when ModelsService throws an error', async () => {
      // Arrange
      const error = new Error('Models service error')
      mockModelsService.getModels.mockRejectedValue(error)

      // Act
      const response = await GET()
      const responseBody = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseBody.error).toBe('Failed to fetch models')
      expect(mockModelsService.getModels).toHaveBeenCalled()
    })

    it('should use NoOpLogger in production environment', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'production')
      
      const mockModels: any[] = []
      mockModelsService.getModels.mockResolvedValue(mockModels)

      // Act
      await GET()

      // Assert
      expect(NoOpLogger).toHaveBeenCalled()
      expect(ConsoleLogger).not.toHaveBeenCalled()
      
      // Cleanup
      vi.unstubAllEnvs()
    })

    it('should use ConsoleLogger in development environment', async () => {
      // Arrange
      vi.stubEnv('NODE_ENV', 'development')
      
      const mockModels: any[] = []
      mockModelsService.getModels.mockResolvedValue(mockModels)

      // Act
      await GET()

      // Assert
      expect(ConsoleLogger).toHaveBeenCalled()
      expect(NoOpLogger).not.toHaveBeenCalled()
      
      // Cleanup
      vi.unstubAllEnvs()
    })

    it('should handle empty models array', async () => {
      // Arrange
      const mockModels: any[] = []
      mockModelsService.getModels.mockResolvedValue(mockModels)

      // Act
      const response = await GET()
      const responseBody = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseBody).toEqual([])
      expect(mockModelsService.getModels).toHaveBeenCalled()
    })

    it('should handle large models array', async () => {
      // Arrange
      const mockModels = Array.from({ length: 100 }, (_, i) => ({
        name: `model-${i}`,
        title: `Model ${i}`,
        description: `Description for model ${i}`
      }))
      
      mockModelsService.getModels.mockResolvedValue(mockModels)

      // Act
      const response = await GET()
      const responseBody = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseBody).toHaveLength(100)
      expect(responseBody[0].name).toBe('model-0')
      expect(responseBody[99].name).toBe('model-99')
    })
  })
}) 