import { FireworksSDK } from '@/app/lib/fireworks/fireworks-sdk'
import { MockFireworksSDK } from '@/app/lib/fireworks/mock-fireworks-sdk'
import { Logger } from '@/app/lib/logger'

export class ChatService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async createChatStream(model: string, messages: any[]) {
    this.logger.info('ChatService.createChatStream called', { model, messageCount: messages.length })
    
    const mock = process.env.MOCK_FIREWORKS === 'true'
    this.logger.info('Mock mode:', mock)
    
    if (mock) {
      this.logger.info('Using MockFireworksSDK for chat')
      const mockFireworks = new MockFireworksSDK()
      const stream = await mockFireworks.createCompletionStream({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      })
      this.logger.info('Mock chat stream created successfully')
      return stream
    }

    const apiKey = process.env.FIREWORKS_API_KEY
    if (!apiKey) {
      this.logger.error('FIREWORKS_API_KEY is not configured')
      throw new Error('FIREWORKS_API_KEY is not configured')
    }
    
    const fireworks = new FireworksSDK(apiKey)
    const stream = await fireworks.createCompletionStream({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    })
    
    this.logger.info('Chat stream created successfully')
    return stream
  }
} 