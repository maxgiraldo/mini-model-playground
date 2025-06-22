'use client'

import { ArrowUpIcon } from '@heroicons/react/20/solid'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { useModels } from '../hooks/useModels'
import { useStreamReader } from '../hooks/useStreamReader'
import LoadingIndicator from './LoadingIndicator'
import ModelSelector from './ModelSelector'

interface Message {
  role: 'user' | 'assistant'
  content: string
  model?: string
  ttft?: number
  responseTime?: number
  tps?: number
  isError?: boolean
}

export default function Chat() {
  const { models, selectedModel, setSelectedModel, isLoading, error } = useModels()
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef({
    startTime: 0,
    firstChunkTime: 0,
    tokenCount: 0,
  })

  const { processStream } = useStreamReader({
    onChunk: (content) => {
      if (metricsRef.current.firstChunkTime === 0) {
        metricsRef.current.firstChunkTime = Date.now()
      }
      // Using character count / 4 as a proxy for token count
      metricsRef.current.tokenCount += content.length / 4
      setMessages((prev) => {
        if (prev.length === 0) return prev

        const lastMessage = prev[prev.length - 1]

        if (lastMessage.role !== 'assistant' || lastMessage.isError) {
          return prev
        }

        const updatedLastMessage = {
          ...lastMessage,
          content: lastMessage.content + content,
        }

        return [...prev.slice(0, -1), updatedLastMessage]
      })
    },
    onError: (error) => {
      console.error('Stream error:', error)
      setIsSubmitting(false)
    },
    onComplete: () => {
      const endTime = Date.now()
      const { startTime, firstChunkTime, tokenCount } = metricsRef.current

      if (startTime && firstChunkTime) {
        const responseTime = endTime - startTime
        const ttft = firstChunkTime - startTime
        const generationTimeInSeconds = (endTime - firstChunkTime) / 1000
        const tps =
          generationTimeInSeconds > 0
            ? tokenCount / generationTimeInSeconds
            : 0

        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.ttft = ttft
            lastMessage.responseTime = responseTime
            lastMessage.tps = tps
          }
          return newMessages
        })
      }

      setIsSubmitting(false)
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [inputValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || !selectedModel || isSubmitting) {
      return
    }

    metricsRef.current = {
      startTime: Date.now(),
      firstChunkTime: 0,
      tokenCount: 0,
    }

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsSubmitting(true)

    const newMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newMessages)

    setMessages(prev => [...prev, { role: 'assistant', content: '', model: selectedModel.title }])

    try {
      const payloadMessages = newMessages.map(({ role, content }) => ({
        role,
        content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel.name,
          messages: payloadMessages,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (reader) {
        await processStream(reader)
      }
    } catch (error) {
      console.error('Chat submission error:', error)
      setIsSubmitting(false)
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content =
            error instanceof Error ? error.message : 'An unknown error occurred.'
          lastMessage.isError = true
        }
        return newMessages
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          if (
            message.role === 'assistant' &&
            isSubmitting &&
            message.content === ''
          ) {
            return <LoadingIndicator key={index} />
          }

          const processedContent = message.content
            .replace(/<think>/g, '<div class="think-content">')
            .replace(/<\/think>/g, '</div>')

          return (
            <div
              key={index}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'
                }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isError
                  ? 'bg-red-100 text-red-800'
                  : message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                  }`}
              >
                <div
                  className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''
                    }`}
                >
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      },
                    }}
                  >
                    {processedContent}
                  </ReactMarkdown>
                </div>
              </div>
              {message.role === 'assistant' && !message.isError && (
                <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                  {message.model && <span>{message.model}</span>}
                  {message.ttft !== undefined && (
                    <span className="text-gray-500">
                      TTFT: {message.ttft}ms
                    </span>
                  )}
                  {message.responseTime !== undefined && (
                    <span className="text-gray-500">
                      RT: {(message.responseTime / 1000).toFixed(2)}s
                    </span>
                  )}
                  {message.tps !== undefined && (
                    <span className="text-gray-500">
                      TPS: {message.tps.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex flex-col rounded-lg bg-white outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <textarea
            ref={textareaRef}
            id="message"
            name="message"
            rows={1}
            placeholder="How can I help you today?"
            className="block w-full resize-none border-0 bg-transparent p-3 text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm/6"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSubmitting}
            autoFocus
          />

          <div className="flex items-center justify-between p-2 border-t border-gray-200">
            <div className="flex-1 pr-2">
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                isLoading={isLoading}
                error={error}
              />
            </div>
            <div className="shrink-0">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                disabled={!inputValue.trim() || !selectedModel || isSubmitting}
              >
                <ArrowUpIcon className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

