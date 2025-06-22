import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ChatService } from '../chat-service'
import { ConsoleLogger } from '@/app/lib/logger'
import { FireworksSDK } from '@/app/lib/fireworks/fireworks-sdk'
import { MockFireworksSDK } from '@/app/lib/fireworks/mock-fireworks-sdk'

// Mock the SDKs
vi.mock('@/app/lib/fireworks/fireworks-sdk')
vi.mock('@/app/lib/fireworks/mock-fireworks-sdk')

describe('ChatService', () => {
  let chatService: ChatService
  let mockLogger: ConsoleLogger

  beforeEach(() => {
    mockLogger = new ConsoleLogger()
    chatService = new ChatService(mockLogger)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('constructor', () => {
    it('should create instance with logger', () => {
      expect(chatService).toBeInstanceOf(ChatService)
    })
  })

  describe('createChatStream - Mock Mode', () => {
    beforeEach(() => {
      vi.stubEnv('MOCK_FIREWORKS', 'true')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should use MockFireworksSDK when MOCK_FIREWORKS is true', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"content": "test"}\n\n'))
          controller.close()
        }
      })

      const mockCreateStream = vi.fn().mockResolvedValue(mockStream)
      vi.mocked(MockFireworksSDK).mockImplementation(() => ({
        createCompletionStream: mockCreateStream
      } as any))

      const result = await chatService.createChatStream('accounts/fireworks/models/qwen3-30b-a3b', [
        { role: 'user', content: 'Hello' }
      ])

      expect(MockFireworksSDK).toHaveBeenCalled()
      expect(mockCreateStream).toHaveBeenCalledWith({
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      })
      expect(result).toBeInstanceOf(ReadableStream)
    })
  })

  describe('createChatStream - Real Mode', () => {
    beforeEach(() => {
      vi.stubEnv('MOCK_FIREWORKS', 'false')
      vi.stubEnv('FIREWORKS_API_KEY', 'test-api-key')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should use FireworksSDK when MOCK_FIREWORKS is false', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"content": "test"}\n\n'))
          controller.close()
        }
      })

      const mockCreateStream = vi.fn().mockResolvedValue(mockStream)
      vi.mocked(FireworksSDK).mockImplementation(() => ({
        createCompletionStream: mockCreateStream
      } as any))

      const result = await chatService.createChatStream('accounts/fireworks/models/llama-v3-8b-instruct', [
        { role: 'user', content: 'Hello' }
      ])

      expect(FireworksSDK).toHaveBeenCalledWith('test-api-key')
      expect(mockCreateStream).toHaveBeenCalledWith({
        model: 'accounts/fireworks/models/llama-v3-8b-instruct',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      })
      expect(result).toBeInstanceOf(ReadableStream)
    })

    it('should throw error when API key is missing', async () => {
      vi.unstubAllEnvs()
      vi.stubEnv('MOCK_FIREWORKS', 'false')
      // Don't set FIREWORKS_API_KEY

      await expect(chatService.createChatStream('accounts/fireworks/models/qwen3-30b-a3b', [
        { role: 'user', content: 'Hello' }
      ])).rejects.toThrow('FIREWORKS_API_KEY is not configured')
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      vi.stubEnv('MOCK_FIREWORKS', 'true')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should propagate errors from SDK for streaming', async () => {
      const mockError = new Error('Streaming Error')
      const mockCreateStream = vi.fn().mockRejectedValue(mockError)
      vi.mocked(MockFireworksSDK).mockImplementation(() => ({
        createCompletionStream: mockCreateStream
      } as any))

      await expect(chatService.createChatStream('accounts/fireworks/models/qwen3-30b-a3b', [
        { role: 'user', content: 'Hello' }
      ])).rejects.toThrow('Streaming Error')
    })
  })
}) 