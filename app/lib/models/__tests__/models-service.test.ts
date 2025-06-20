import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ModelsService } from '../models-service'
import { ConsoleLogger, NoOpLogger } from '@/app/lib/logger'
import { FireworksSDK } from '@/app/lib/fireworks/fireworks-sdk'
import { MockFireworksSDK } from '@/app/lib/fireworks/mock-fireworks-sdk'

// Mock the SDKs
vi.mock('@/app/lib/fireworks/fireworks-sdk')
vi.mock('@/app/lib/fireworks/mock-fireworks-sdk')

describe('ModelsService', () => {
  let modelsService: ModelsService
  let mockLogger: ConsoleLogger

  beforeEach(() => {
    mockLogger = new ConsoleLogger()
    modelsService = new ModelsService(mockLogger)
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('should create instance with logger', () => {
      expect(modelsService).toBeInstanceOf(ModelsService)
    })
  })

  describe('getModels - Mock Mode', () => {
    beforeEach(() => {
      vi.stubEnv('MOCK_FIREWORKS', 'true')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should use MockFireworksSDK when MOCK_FIREWORKS is true', async () => {
      const mockModels = [
        {
          name: 'accounts/fireworks/models/qwen3-30b-a3b',
          title: 'Qwen3 30B-A3B',
          description: 'Latest Qwen3 state of the art model',
          provider: {
            name: 'Qwen',
            hf: 'Qwen',
            org: {
              name: 'Qwen',
              logos: {
                logomark: {
                  src: '/images/logos/qwen-icon.svg'
                }
              }
            }
          },
          type: 'text',
          serverless: true,
          contextLength: 40000,
          supportsImageInput: false,
          tags: ['Serverless', 'LLM', 'Chat'],
          cost: {
            inputTokenPrice: 0.15,
            outputTokenPrice: 0.6,
            tokenPrice: 0.15
          }
        }
      ]

      const mockGetModels = vi.fn().mockResolvedValue(mockModels)
      vi.mocked(MockFireworksSDK).mockImplementation(() => ({
        getModels: mockGetModels
      } as any))

      const result = await modelsService.getModels()

      expect(MockFireworksSDK).toHaveBeenCalled()
      expect(mockGetModels).toHaveBeenCalled()
      expect(result).toEqual(mockModels)
    })

    it('should cache mock models', async () => {
      const mockModels = [
        {
          name: 'accounts/fireworks/models/qwen3-30b-a3b',
          title: 'Qwen3 30B-A3B',
          description: 'Latest Qwen3 state of the art model',
          provider: {
            name: 'Qwen',
            hf: 'Qwen',
            org: {
              name: 'Qwen',
              logos: {
                logomark: {
                  src: '/images/logos/qwen-icon.svg'
                }
              }
            }
          },
          type: 'text',
          serverless: true,
          contextLength: 40000,
          supportsImageInput: false,
          tags: ['Serverless', 'LLM', 'Chat'],
          cost: {
            inputTokenPrice: 0.15,
            outputTokenPrice: 0.6,
            tokenPrice: 0.15
          }
        }
      ]

      const mockGetModels = vi.fn().mockResolvedValue(mockModels)
      vi.mocked(MockFireworksSDK).mockImplementation(() => ({
        getModels: mockGetModels
      } as any))

      // First call
      const result1 = await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const result2 = await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(1) // Still only called once
      expect(result1).toEqual(result2)
    })
  })

  describe('getModels - Real Mode', () => {
    beforeEach(() => {
      vi.stubEnv('MOCK_FIREWORKS', 'false')
      vi.stubEnv('FIREWORKS_API_KEY', 'test-api-key')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should use FireworksSDK when MOCK_FIREWORKS is false', async () => {
      const mockModels = [
        {
          name: 'accounts/fireworks/models/llama-v3-8b-instruct',
          title: 'Llama v3 8B Instruct',
          description: 'Meta\'s latest Llama model',
          provider: {
            name: 'Meta',
            hf: 'meta-llama',
            org: {
              name: 'Meta',
              logos: {
                logomark: {
                  src: '/images/logos/meta-icon.svg'
                }
              }
            }
          },
          type: 'text',
          serverless: true,
          contextLength: 8192,
          supportsImageInput: false,
          tags: ['Serverless', 'LLM', 'Chat'],
          cost: {
            inputTokenPrice: 0.1,
            outputTokenPrice: 0.4,
            tokenPrice: 0.1
          }
        }
      ]

      const mockGetModels = vi.fn().mockResolvedValue(mockModels)
      vi.mocked(FireworksSDK).mockImplementation(() => ({
        getModels: mockGetModels
      } as any))

      const result = await modelsService.getModels()

      expect(FireworksSDK).toHaveBeenCalledWith('test-api-key')
      expect(mockGetModels).toHaveBeenCalled()
      expect(result).toEqual(mockModels)
    })

    it('should throw error when API key is missing', async () => {
      vi.unstubAllEnvs()
      vi.stubEnv('MOCK_FIREWORKS', 'false')
      // Don't set FIREWORKS_API_KEY

      await expect(modelsService.getModels()).rejects.toThrow('FIREWORKS_API_KEY is not configured')
    })

    it('should cache real models', async () => {
      const mockModels = [
        {
          name: 'accounts/fireworks/models/llama-v3-8b-instruct',
          title: 'Llama v3 8B Instruct',
          description: 'Meta\'s latest Llama model',
          provider: {
            name: 'Meta',
            hf: 'meta-llama',
            org: {
              name: 'Meta',
              logos: {
                logomark: {
                  src: '/images/logos/meta-icon.svg'
                }
              }
            }
          },
          type: 'text',
          serverless: true,
          contextLength: 8192,
          supportsImageInput: false,
          tags: ['Serverless', 'LLM', 'Chat'],
          cost: {
            inputTokenPrice: 0.1,
            outputTokenPrice: 0.4,
            tokenPrice: 0.1
          }
        }
      ]

      const mockGetModels = vi.fn().mockResolvedValue(mockModels)
      vi.mocked(FireworksSDK).mockImplementation(() => ({
        getModels: mockGetModels
      } as any))

      // First call
      const result1 = await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const result2 = await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(1) // Still only called once
      expect(result1).toEqual(result2)
    })
  })

  describe('caching behavior', () => {
    beforeEach(() => {
      vi.stubEnv('MOCK_FIREWORKS', 'true')
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.unstubAllEnvs()
      vi.useRealTimers()
    })

    it('should return cached models within cache duration', async () => {
      const mockModels = [
        {
          name: 'accounts/fireworks/models/qwen3-30b-a3b',
          title: 'Qwen3 30B-A3B',
          description: 'Latest Qwen3 state of the art model',
          provider: {
            name: 'Qwen',
            hf: 'Qwen',
            org: {
              name: 'Qwen',
              logos: {
                logomark: {
                  src: '/images/logos/qwen-icon.svg'
                }
              }
            }
          },
          type: 'text',
          serverless: true,
          contextLength: 40000,
          supportsImageInput: false,
          tags: ['Serverless', 'LLM', 'Chat'],
          cost: {
            inputTokenPrice: 0.15,
            outputTokenPrice: 0.6,
            tokenPrice: 0.15
          }
        }
      ]

      const mockGetModels = vi.fn().mockResolvedValue(mockModels)
      vi.mocked(MockFireworksSDK).mockImplementation(() => ({
        getModels: mockGetModels
      } as any))

      // First call
      await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(1)

      // Advance time by 2 minutes (within 5-minute cache)
      vi.advanceTimersByTime(2 * 60 * 1000)

      // Second call should use cache
      await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(1) // Still only called once
    })

    it('should refetch models after cache expires', async () => {
      const mockModels = [
        {
          name: 'accounts/fireworks/models/qwen3-30b-a3b',
          title: 'Qwen3 30B-A3B',
          description: 'Latest Qwen3 state of the art model',
          provider: {
            name: 'Qwen',
            hf: 'Qwen',
            org: {
              name: 'Qwen',
              logos: {
                logomark: {
                  src: '/images/logos/qwen-icon.svg'
                }
              }
            }
          },
          type: 'text',
          serverless: true,
          contextLength: 40000,
          supportsImageInput: false,
          tags: ['Serverless', 'LLM', 'Chat'],
          cost: {
            inputTokenPrice: 0.15,
            outputTokenPrice: 0.6,
            tokenPrice: 0.15
          }
        }
      ]

      const mockGetModels = vi.fn().mockResolvedValue(mockModels)
      vi.mocked(MockFireworksSDK).mockImplementation(() => ({
        getModels: mockGetModels
      } as any))

      // First call
      await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(1)

      // Advance time by 6 minutes (beyond 5-minute cache)
      vi.advanceTimersByTime(6 * 60 * 1000)

      // Second call should refetch
      await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(2)
    })
  })

  describe('clearCache', () => {
    beforeEach(() => {
      vi.stubEnv('MOCK_FIREWORKS', 'true')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should clear cache and force refetch', async () => {
      const mockModels = [
        {
          name: 'accounts/fireworks/models/qwen3-30b-a3b',
          title: 'Qwen3 30B-A3B',
          description: 'Latest Qwen3 state of the art model',
          provider: {
            name: 'Qwen',
            hf: 'Qwen',
            org: {
              name: 'Qwen',
              logos: {
                logomark: {
                  src: '/images/logos/qwen-icon.svg'
                }
              }
            }
          },
          type: 'text',
          serverless: true,
          contextLength: 40000,
          supportsImageInput: false,
          tags: ['Serverless', 'LLM', 'Chat'],
          cost: {
            inputTokenPrice: 0.15,
            outputTokenPrice: 0.6,
            tokenPrice: 0.15
          }
        }
      ]

      const mockGetModels = vi.fn().mockResolvedValue(mockModels)
      vi.mocked(MockFireworksSDK).mockImplementation(() => ({
        getModels: mockGetModels
      } as any))

      // First call
      await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(1)

      // Clear cache
      modelsService.clearCache()

      // Second call should refetch
      await modelsService.getModels()
      expect(mockGetModels).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      vi.stubEnv('MOCK_FIREWORKS', 'true')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should propagate errors from SDK', async () => {
      const mockError = new Error('SDK Error')
      const mockGetModels = vi.fn().mockRejectedValue(mockError)
      vi.mocked(MockFireworksSDK).mockImplementation(() => ({
        getModels: mockGetModels
      } as any))

      await expect(modelsService.getModels()).rejects.toThrow('SDK Error')
    })
  })
}) 