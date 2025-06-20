import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MockFireworksSDK } from '../mock-fireworks-sdk'
import { FireworksModel, FireworksChatRequest } from '../fireworks-ai'

describe('MockFireworksSDK', () => {
  let mockSdk: MockFireworksSDK

  beforeEach(() => {
    mockSdk = new MockFireworksSDK()
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create instance with mock models', () => {
      expect(mockSdk).toBeInstanceOf(MockFireworksSDK)
    })
  })

  describe('getModels', () => {
    it('should return mock models with delay', async () => {
      const startTime = Date.now()
      const result = await mockSdk.getModels()
      const endTime = Date.now()

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        name: 'accounts/fireworks/models/qwen3-30b-a3b',
        title: 'Qwen3 30B-A3B',
        type: 'text',
        serverless: true
      })
      expect(result[1]).toMatchObject({
        name: 'accounts/fireworks/models/llama-v3-8b-instruct',
        title: 'Llama v3 8B Instruct',
        type: 'text',
        serverless: true
      })
      expect(endTime - startTime).toBeGreaterThanOrEqual(100) // Should have delay
    })
  })

  describe('createChatCompletion', () => {
    it('should return mock chat completion with delay', async () => {
      const request: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello' }]
      }

      const startTime = Date.now()
      const result = await mockSdk.createChatCompletion(request)
      const endTime = Date.now()

      expect(result).toMatchObject({
        id: expect.stringContaining('mock-chat-'),
        object: 'chat.completion',
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: expect.any(String)
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: expect.any(Number),
          completion_tokens: expect.any(Number),
          total_tokens: expect.any(Number)
        }
      })
      expect(endTime - startTime).toBeGreaterThanOrEqual(200) // Should have delay
    })

    it('should generate contextual responses based on input', async () => {
      const helloRequest: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello there!' }]
      }

      const weatherRequest: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'What is the weather like?' }]
      }

      const jokeRequest: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Tell me a joke' }]
      }

      const helloResult = await mockSdk.createChatCompletion(helloRequest)
      const weatherResult = await mockSdk.createChatCompletion(weatherRequest)
      const jokeResult = await mockSdk.createChatCompletion(jokeRequest)

      expect(helloResult.choices[0].message.content).toContain('Hello')
      expect(weatherResult.choices[0].message.content).toContain('weather')
      expect(jokeResult.choices[0].message.content).toContain('atoms')
    })

    it('should calculate token usage correctly', async () => {
      const request: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello world' }]
      }

      const result = await mockSdk.createChatCompletion(request)

      expect(result.usage.prompt_tokens).toBeGreaterThan(0)
      expect(result.usage.completion_tokens).toBeGreaterThan(0)
      expect(result.usage.total_tokens).toBe(result.usage.prompt_tokens + result.usage.completion_tokens)
    })
  })

  describe('createChatCompletionStream', () => {
    it('should return a readable stream with delay', async () => {
      const request: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello' }]
      }

      const startTime = Date.now()
      const stream = await mockSdk.createChatCompletionStream(request)
      const endTime = Date.now()

      expect(stream).toBeInstanceOf(ReadableStream)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100) // Should have delay
    })

    it('should stream words with proper formatting', async () => {
      const request: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: 'Hello' }]
      }

      const stream = await mockSdk.createChatCompletionStream(request)
      const reader = stream.getReader()
      const chunks: string[] = []

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = new TextDecoder().decode(value)
          chunks.push(text)
        }
      } finally {
        reader.releaseLock()
      }

      // Should have multiple chunks
      expect(chunks.length).toBeGreaterThan(1)
      
      // First chunk should contain initial data with role
      expect(chunks[0]).toContain('data: ')
      expect(chunks[0]).toContain('"delta":{"role":"assistant"}')
      
      // Last chunk should contain [DONE]
      expect(chunks[chunks.length - 1]).toContain('data: [DONE]')
    })

    it('should handle different message types', async () => {
      const request: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'What is the weather?' }
        ]
      }

      const stream = await mockSdk.createChatCompletionStream(request)
      expect(stream).toBeInstanceOf(ReadableStream)
    })
  })

  describe('response generation', () => {
    it('should handle empty messages array', async () => {
      const request: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: []
      }

      const result = await mockSdk.createChatCompletion(request)
      expect(result.choices[0].message.content).toContain('mock response')
    })

    it('should handle messages without content', async () => {
      const request: FireworksChatRequest = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [{ role: 'user', content: '' }]
      }

      const result = await mockSdk.createChatCompletion(request)
      expect(result.choices[0].message.content).toContain('mock response')
    })
  })
}) 