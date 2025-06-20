import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FireworksSDK } from '../fireworks-sdk'
import { FireworksModel, FireworksChatRequest, FireworksChatResponse } from '../fireworks-ai'

// Mock fetch globally
global.fetch = vi.fn()

describe('FireworksSDK', () => {
  let sdk: FireworksSDK
  const mockApiKey = 'test-api-key'

  beforeEach(() => {
    sdk = new FireworksSDK(mockApiKey)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('constructor', () => {
    it('should create instance with API key', () => {
      expect(sdk).toBeInstanceOf(FireworksSDK)
    })
  })

  describe('getModels', () => {
    it('should fetch models successfully', async () => {
      const mockModels: FireworksModel[] = [
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

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockModels)
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      const result = await sdk.getModels()

      expect(global.fetch).toHaveBeenCalledWith('https://app.fireworks.ai/api/models/mini-playground')
      expect(result).toEqual(mockModels)
    })

    it('should throw error when fetch fails', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Not Found'
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      await expect(sdk.getModels()).rejects.toThrow('Failed to fetch models: Not Found')
    })

    it('should throw error when network error occurs', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      await expect(sdk.getModels()).rejects.toThrow('Network error')
    })
  })

  describe('createChatCompletion', () => {
    it('should create chat completion successfully', async () => {
      const mockRequest: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello' }]
      }

      const mockResponse: FireworksChatResponse = {
        id: 'chat-1',
        object: 'chat.completion',
        created: Date.now(),
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        choices: [{
          index: 0,
          message: { role: 'assistant', content: 'Hi there!' },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15
        }
      }

      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse)
      }

      ;(global.fetch as any).mockResolvedValue(mockFetchResponse)

      const result = await sdk.createChatCompletion(mockRequest)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.fireworks.ai/inference/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockRequest),
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when chat completion fails', async () => {
      const mockRequest: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello' }]
      }

      const mockResponse = {
        ok: false,
        statusText: 'Bad Request'
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      await expect(sdk.createChatCompletion(mockRequest)).rejects.toThrow('Chat completion failed: Bad Request')
    })
  })

  describe('createChatCompletionStream', () => {
    it('should create streaming chat completion successfully', async () => {
      const mockRequest: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true
      }

      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"content": "test"}\n\n'))
          controller.close()
        }
      })

      const mockResponse = {
        ok: true,
        body: mockReadableStream
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      const result = await sdk.createChatCompletionStream(mockRequest)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.fireworks.ai/inference/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...mockRequest,
            stream: true,
          }),
        }
      )
      expect(result).toBeInstanceOf(ReadableStream)
    })

    it('should throw error when streaming fails', async () => {
      const mockRequest: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true
      }

      const mockResponse = {
        ok: false,
        statusText: 'Internal Server Error'
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      await expect(sdk.createChatCompletionStream(mockRequest)).rejects.toThrow('Streaming chat completion failed: Internal Server Error')
    })

    it('should throw error when response body is null', async () => {
      const mockRequest: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true
      }

      const mockResponse = {
        ok: true,
        body: null
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      await expect(sdk.createChatCompletionStream(mockRequest)).rejects.toThrow('Response body is null')
    })
  })
}) 