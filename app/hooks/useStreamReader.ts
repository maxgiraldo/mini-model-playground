import { useCallback } from 'react'

interface StreamChunk {
  content?: string
  done: boolean
}

interface UseStreamReaderOptions {
  onChunk: (content: string) => void
  onError?: (error: Error) => void
  onComplete?: () => void
}

/**
 * Custom React hook for processing Server-Sent Events (SSE) streams from AI model APIs
 *
 * This hook provides a robust way to handle streaming responses from both chat completion
 * and completion APIs, specifically designed for OpenAI-compatible streaming formats used
 * by services like Fireworks AI.
 *
 * Features:
 * - Parses SSE data format with proper error handling
 * - Supports both chat completions (choices[0].delta.content) and completions (choices[0].text) formats
 * - Handles stream completion detection via '[DONE]' markers
 * - Provides callbacks for content chunks, errors, and completion
 * - Automatically decodes UTF-8 text streams
 * - Graceful error handling for malformed JSON data
 *
 * @param options Configuration object containing callback functions
 * @returns Object containing the processStream function
 *
 * @example
 * ```tsx
 * const { processStream } = useStreamReader({
 *   onChunk: (content) => setMessage(prev => prev + content),
 *   onError: (error) => console.error('Stream error:', error),
 *   onComplete: () => setIsLoading(false)
 * })
 *
 * // Use with fetch response
 * const response = await fetch('/api/completions', { ... })
 * const reader = response.body?.getReader()
 * if (reader) {
 *   await processStream(reader)
 * }
 * ```
 */
export function useStreamReader({ onChunk, onError, onComplete }: UseStreamReaderOptions) {
  /**
   * Processes a ReadableStream from an SSE response
   *
   * This function handles the low-level details of reading from a stream,
   * decoding UTF-8 text, parsing SSE format, and extracting content from
   * OpenAI-compatible completion and chat completion responses.
   *
   * The expected SSE formats are:
   *
   * Completions API:
   * ```
   * data: {"choices":[{"text":"Hello"}]}
   * data: {"choices":[{"text":" world"}]}
   * data: [DONE]
   * ```
   *
   * Chat Completions API:
   * ```
   * data: {"choices":[{"delta":{"content":"Hello"}}]}
   * data: {"choices":[{"delta":{"content":" world"}}]}
   * data: [DONE]
   * ```
   *
   * @param reader The ReadableStreamDefaultReader to process
   */
  const processStream = useCallback(async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              onComplete?.()
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              // Support both completions API and chat completions API
              const content = parsed.choices?.[0]?.text || parsed.choices?.[0]?.delta?.content || ''

              if (content) {
                onChunk(content)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
              onError?.(e instanceof Error ? e : new Error('Failed to parse SSE data'))
            }
          }
        }
      }
      
      onComplete?.()
    } catch (error) {
      console.error('Stream processing error:', error)
      onError?.(error instanceof Error ? error : new Error('Stream processing failed'))
    }
  }, [onChunk, onError, onComplete])

  return { processStream }
}

/**
 * Utility function for parsing individual SSE chunks
 *
 * This function is primarily useful for testing and debugging SSE stream parsing.
 * It takes a raw chunk string and extracts all valid content pieces and completion markers.
 * Supports both completions and chat completions API formats.
 *
 * @param chunk Raw SSE chunk string containing one or more SSE events
 * @returns Array of parsed StreamChunk objects
 *
 * @example
 * ```ts
 * // Completions API
 * const chunks1 = parseSSEChunk('data: {"choices":[{"text":"Hello"}]}\ndata: [DONE]\n')
 * // Returns: [{ content: "Hello", done: false }, { done: true }]
 *
 * // Chat Completions API
 * const chunks2 = parseSSEChunk('data: {"choices":[{"delta":{"content":"Hello"}}]}\ndata: [DONE]\n')
 * // Returns: [{ content: "Hello", done: false }, { done: true }]
 * ```
 */
export function parseSSEChunk(chunk: string): StreamChunk[] {
  const lines = chunk.split('\n')
  const chunks: StreamChunk[] = []

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6)
      if (data === '[DONE]') {
        chunks.push({ done: true })
      } else {
        try {
          const parsed = JSON.parse(data)
          // Support both completions API (choices[0].text) and chat completions API (choices[0].delta.content)
          const content = parsed.choices?.[0]?.text || parsed.choices?.[0]?.delta?.content || ''
          if (content) {
            chunks.push({ content, done: false })
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e)
        }
      }
    }
  }

  return chunks
}

/**
 * Type definitions for external use
 */
export type { StreamChunk, UseStreamReaderOptions }