'use client'

import { useEffect, useRef, useState } from 'react'
import { useModels } from '../hooks/useModels'
import { useStreamReader } from '../hooks/useStreamReader'
import ChatInput from './ChatInput'
import ChatMessage, { Message } from './ChatMessage'
import LoadingIndicator from './LoadingIndicator'

export default function Chat() {
  const { models, selectedModel, setSelectedModel, isLoading, error } =
    useModels()
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef({
    startTime: 0,
    firstChunkTime: 0,
    tokenCount: 0,
  })
  const hasMessages = messages.length > 0

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
    if (hasMessages) {
      scrollToBottom()
    }
  }, [messages, hasMessages])

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

    const newMessages = [
      ...messages,
      { role: 'user' as const, content: userMessage },
    ]
    setMessages(newMessages)

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', model: selectedModel.title },
    ])

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
      setMessages((prev) => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content =
            error instanceof Error
              ? error.message
              : 'An unknown error occurred.'
          lastMessage.isError = true
        }
        return newMessages
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {hasMessages && (
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="w-full max-w-2xl mx-auto">
            <div className="space-y-4">
              {messages.map((message, index) => {
                if (
                  message.role === 'assistant' &&
                  isSubmitting &&
                  message.content === ''
                ) {
                  return <LoadingIndicator key={index} />
                }
                return (
                  <ChatMessage key={index} message={message} index={index} />
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      <div
        className={`w-full max-w-2xl mx-auto transition-all duration-500 ease-in-out ${hasMessages
          ? 'px-4 pb-4'
          : 'flex-grow flex flex-col justify-center'
          }`}
      >
        {!hasMessages && (
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-700 tracking-tight">
              Mini Model Playground
            </h1>
          </div>
        )}
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          models={models}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  )
}

