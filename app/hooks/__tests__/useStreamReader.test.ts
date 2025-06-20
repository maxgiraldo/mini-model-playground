import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useStreamReader, parseSSEChunk } from '../useStreamReader'

// Mock console methods to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('useStreamReader', () => {
  beforeEach(() => {
    consoleSpy.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const createMockReader = (chunks: string[]) => {
    let index = 0
    return {
      read: vi.fn().mockImplementation(() => {
        if (index >= chunks.length) {
          return Promise.resolve({ done: true, value: undefined })
        }
        const chunk = chunks[index++]
        const encoder = new TextEncoder()
        return Promise.resolve({ done: false, value: encoder.encode(chunk) })
      })
    } as unknown as ReadableStreamDefaultReader<Uint8Array>
  }

  describe('processStream', () => {
    it('should process completions API streaming format correctly', async () => {
      const onChunk = vi.fn()
      const onComplete = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useStreamReader({ onChunk, onComplete, onError })
      )

      const chunks = [
        'data: {"choices":[{"text":"Hello"}]}\n',
        'data: {"choices":[{"text":" world"}]}\n',
        'data: [DONE]\n'
      ]

      const mockReader = createMockReader(chunks)

      await act(async () => {
        await result.current.processStream(mockReader)
      })

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
      expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onError).not.toHaveBeenCalled()
    })

    it('should process chat completions API streaming format correctly', async () => {
      const onChunk = vi.fn()
      const onComplete = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useStreamReader({ onChunk, onComplete, onError })
      )

      const chunks = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n',
        'data: [DONE]\n'
      ]

      const mockReader = createMockReader(chunks)

      await act(async () => {
        await result.current.processStream(mockReader)
      })

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
      expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onError).not.toHaveBeenCalled()
    })

    it('should handle mixed content in single chunk', async () => {
      const onChunk = vi.fn()
      const onComplete = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useStreamReader({ onChunk, onComplete, onError })
      )

      const chunks = [
        'data: {"choices":[{"text":"Hello"}]}\ndata: {"choices":[{"text":" world"}]}\ndata: [DONE]\n'
      ]

      const mockReader = createMockReader(chunks)

      await act(async () => {
        await result.current.processStream(mockReader)
      })

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
      expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onError).not.toHaveBeenCalled()
    })

    it('should skip empty content chunks', async () => {
      const onChunk = vi.fn()
      const onComplete = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useStreamReader({ onChunk, onComplete, onError })
      )

      const chunks = [
        'data: {"choices":[{"text":""}]}\n',
        'data: {"choices":[{"text":"Hello"}]}\n',
        'data: {"choices":[{"delta":{"content":""}}]}\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n',
        'data: [DONE]\n'
      ]

      const mockReader = createMockReader(chunks)

      await act(async () => {
        await result.current.processStream(mockReader)
      })

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
      expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onError).not.toHaveBeenCalled()
    })

    it('should handle malformed JSON gracefully', async () => {
      const onChunk = vi.fn()
      const onComplete = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useStreamReader({ onChunk, onComplete, onError })
      )

      const chunks = [
        'data: {"choices":[{"text":"Hello"}]}\n',
        'data: {invalid json}\n',
        'data: {"choices":[{"text":" world"}]}\n',
        'data: [DONE]\n'
      ]

      const mockReader = createMockReader(chunks)

      await act(async () => {
        await result.current.processStream(mockReader)
      })

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
      expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(consoleSpy).toHaveBeenCalledWith('Error parsing SSE data:', expect.any(SyntaxError))
    })

    it('should handle stream without [DONE] marker', async () => {
      const onChunk = vi.fn()
      const onComplete = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useStreamReader({ onChunk, onComplete, onError })
      )

      const chunks = [
        'data: {"choices":[{"text":"Hello"}]}\n',
        'data: {"choices":[{"text":" world"}]}\n'
      ]

      const mockReader = createMockReader(chunks)

      await act(async () => {
        await result.current.processStream(mockReader)
      })

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
      expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onError).not.toHaveBeenCalled()
    })

    it('should handle reader errors', async () => {
      const onChunk = vi.fn()
      const onComplete = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useStreamReader({ onChunk, onComplete, onError })
      )

      const mockReader = {
        read: vi.fn().mockRejectedValue(new Error('Stream read error'))
      } as unknown as ReadableStreamDefaultReader<Uint8Array>

      await act(async () => {
        await result.current.processStream(mockReader)
      })

      expect(onChunk).not.toHaveBeenCalled()
      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(consoleSpy).toHaveBeenCalledWith('Stream processing error:', expect.any(Error))
    })

    it('should ignore non-data lines', async () => {
      const onChunk = vi.fn()
      const onComplete = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useStreamReader({ onChunk, onComplete, onError })
      )

      const chunks = [
        'event: message\n',
        'data: {"choices":[{"text":"Hello"}]}\n',
        'id: 123\n',
        'data: {"choices":[{"text":" world"}]}\n',
        'retry: 1000\n',
        'data: [DONE]\n'
      ]

      const mockReader = createMockReader(chunks)

      await act(async () => {
        await result.current.processStream(mockReader)
      })

      expect(onChunk).toHaveBeenCalledTimes(2)
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
      expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onError).not.toHaveBeenCalled()
    })

    it('should work without optional callbacks', async () => {
      const onChunk = vi.fn()

      const { result } = renderHook(() =>
        useStreamReader({ onChunk })
      )

      const chunks = [
        'data: {"choices":[{"text":"Hello"}]}\n',
        'data: [DONE]\n'
      ]

      const mockReader = createMockReader(chunks)

      await act(async () => {
        await result.current.processStream(mockReader)
      })

      expect(onChunk).toHaveBeenCalledTimes(1)
      expect(onChunk).toHaveBeenCalledWith('Hello')
    })
  })

  describe('parseSSEChunk', () => {
    it('should parse completions API format correctly', () => {
      const chunk = 'data: {"choices":[{"text":"Hello"}]}\ndata: {"choices":[{"text":" world"}]}\ndata: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ content: 'Hello', done: false })
      expect(result[1]).toEqual({ content: ' world', done: false })
      expect(result[2]).toEqual({ done: true })
    })

    it('should parse chat completions API format correctly', () => {
      const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\ndata: {"choices":[{"delta":{"content":" world"}}]}\ndata: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ content: 'Hello', done: false })
      expect(result[1]).toEqual({ content: ' world', done: false })
      expect(result[2]).toEqual({ done: true })
    })

    it('should handle mixed API formats in same chunk', () => {
      const chunk = 'data: {"choices":[{"text":"Hello"}]}\ndata: {"choices":[{"delta":{"content":" world"}}]}\ndata: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ content: 'Hello', done: false })
      expect(result[1]).toEqual({ content: ' world', done: false })
      expect(result[2]).toEqual({ done: true })
    })

    it('should skip empty content', () => {
      const chunk = 'data: {"choices":[{"text":""}]}\ndata: {"choices":[{"text":"Hello"}]}\ndata: {"choices":[{"delta":{"content":""}}]}\ndata: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ content: 'Hello', done: false })
      expect(result[1]).toEqual({ done: true })
    })

    it('should handle malformed JSON gracefully', () => {
      const chunk = 'data: {"choices":[{"text":"Hello"}]}\ndata: {invalid json}\ndata: {"choices":[{"text":" world"}]}\ndata: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ content: 'Hello', done: false })
      expect(result[1]).toEqual({ content: ' world', done: false })
      expect(result[2]).toEqual({ done: true })
      expect(consoleSpy).toHaveBeenCalledWith('Error parsing SSE data:', expect.any(SyntaxError))
    })

    it('should ignore non-data lines', () => {
      const chunk = 'event: message\ndata: {"choices":[{"text":"Hello"}]}\nid: 123\ndata: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ content: 'Hello', done: false })
      expect(result[1]).toEqual({ done: true })
    })

    it('should handle empty chunk', () => {
      const chunk = ''
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(0)
    })

    it('should handle chunk with only non-data lines', () => {
      const chunk = 'event: message\nid: 123\nretry: 1000\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(0)
    })

    it('should handle chunk with only [DONE] marker', () => {
      const chunk = 'data: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ done: true })
    })

    it('should handle missing choices array', () => {
      const chunk = 'data: {"model":"gpt-3.5-turbo"}\ndata: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ done: true })
    })

    it('should handle empty choices array', () => {
      const chunk = 'data: {"choices":[]}\ndata: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ done: true })
    })

    it('should handle missing text/content fields', () => {
      const chunk = 'data: {"choices":[{"index":0}]}\ndata: {"choices":[{"delta":{"role":"assistant"}}]}\ndata: [DONE]\n'
      const result = parseSSEChunk(chunk)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ done: true })
    })
  })
})
