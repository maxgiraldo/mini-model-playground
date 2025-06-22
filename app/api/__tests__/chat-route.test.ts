import { ChatService } from '@/app/lib/chat/chat-service'
import { ConsoleLogger, NoOpLogger } from '@/app/lib/logger'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../chat/route'

vi.mock('@/app/lib/chat/chat-service')
vi.mock('@/app/lib/logger')

const mockChatService = {
  createChatStream: vi.fn(),
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

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(ConsoleLogger).mockImplementation(() => mockConsoleLogger)
    vi.mocked(NoOpLogger).mockImplementation(() => mockNoOpLogger)
    vi.mocked(ChatService).mockImplementation(() => mockChatService as any)
  })

  describe('POST /api/chat', () => {
    it('should return a streaming response for valid request', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"content": "Hello"}\n\n'))
          controller.close()
        }
      })

      mockChatService.createChatStream.mockResolvedValue(mockStream)

      const requestBody = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
      expect(response.headers.get('Cache-Control')).toBe('no-cache')
      expect(response.headers.get('Connection')).toBe('keep-alive')

      expect(mockChatService.createChatStream).toHaveBeenCalledWith(
        requestBody.model,
        requestBody.messages
      )
    })

    it('should return 400 for missing model', async () => {
      const requestBody = {
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const responseBody = await response.json()

      expect(response.status).toBe(400)
      expect(responseBody.error).toBe('Missing required fields: model and messages')
      expect(mockChatService.createChatStream).not.toHaveBeenCalled()
    })

    it('should return 400 for missing messages', async () => {
      const requestBody = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b'
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const responseBody = await response.json()

      expect(response.status).toBe(400)
      expect(responseBody.error).toBe('Missing required fields: model and messages')
      expect(mockChatService.createChatStream).not.toHaveBeenCalled()
    })

    it('should return 400 for non-array messages', async () => {
      const requestBody = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: 'not an array'
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const responseBody = await response.json()

      expect(response.status).toBe(400)
      expect(responseBody.error).toBe('Missing required fields: model and messages')
      expect(mockChatService.createChatStream).not.toHaveBeenCalled()
    })

    it('should return 500 when ChatService throws an error', async () => {
      const error = new Error('Chat service error')
      mockChatService.createChatStream.mockRejectedValue(error)

      const requestBody = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const responseBody = await response.json()

      expect(response.status).toBe(500)
      expect(responseBody.error).toBe('Chat service error')
      expect(mockChatService.createChatStream).toHaveBeenCalledWith(
        requestBody.model,
        requestBody.messages
      )
    })

    it('should use NoOpLogger in production environment', async () => {
      const originalEnv = process.env.NODE_ENV
      vi.stubEnv('NODE_ENV', 'production')

      const mockStream = new ReadableStream()
      mockChatService.createChatStream.mockResolvedValue(mockStream)

      const requestBody = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      await POST(request)

      expect(NoOpLogger).toHaveBeenCalled()
      expect(ConsoleLogger).not.toHaveBeenCalled()

      vi.unstubAllEnvs()
    })

    it('should use ConsoleLogger in development environment', async () => {
      vi.stubEnv('NODE_ENV', 'development')

      const mockStream = new ReadableStream()
      mockChatService.createChatStream.mockResolvedValue(mockStream)

      const requestBody = {
        model: 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      await POST(request)

      expect(ConsoleLogger).toHaveBeenCalled()
      expect(NoOpLogger).not.toHaveBeenCalled()

      vi.unstubAllEnvs()
    })

    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)
      const responseBody = await response.json()

      expect(response.status).toBe(500)
      expect(responseBody.error).toBe(
        'Unexpected token \'i\', "invalid json" is not valid JSON'
      )
    })
  })
})