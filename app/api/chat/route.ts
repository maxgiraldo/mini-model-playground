import { ChatService } from '@/app/lib/chat/chat-service'
import { ConsoleLogger, NoOpLogger } from '@/app/lib/logger'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const logger = process.env.NODE_ENV === 'production' ? new NoOpLogger() : new ConsoleLogger()
  const chatService = new ChatService(logger)

  try {
    const { model, messages } = await request.json()

    if (!model || !messages || !Array.isArray(messages)) {
      logger.error('Invalid request: missing required fields', { model, messages })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: model and messages' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const stream = await chatService.createChatStream(model, messages)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'
    logger.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}