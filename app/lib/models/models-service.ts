import { FireworksSDK } from '@/app/lib/fireworks/fireworks-sdk';
import { MockFireworksSDK } from '@/app/lib/fireworks/mock-fireworks-sdk';
import { Logger } from '@/app/lib/logger';

export class ModelsService {
  private logger: Logger;
  private modelsCache: any[] | null = null;
  private cacheExpiry: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async getModels() {
    this.logger.info('ModelsService.getModels called')

    if (this.modelsCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      this.logger.info('Returning cached models, count:', this.modelsCache.length)
      return this.modelsCache
    }

    const mock = process.env.MOCK_FIREWORKS === 'true'
    this.logger.info('Mock mode:', mock)

    if (mock) {
      this.logger.info('Using MockFireworksSDK')
      const mockFireworks = new MockFireworksSDK()
      const models = await mockFireworks.getModels()
      this.logger.info('Mock models fetched successfully, count:', models.length)

      this.modelsCache = models
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return models
    }

    const apiKey = process.env.FIREWORKS_API_KEY
    if (!apiKey) {
      this.logger.error('FIREWORKS_API_KEY is not configured')
      throw new Error('FIREWORKS_API_KEY is not configured')
    }

    const fireworks = new FireworksSDK(apiKey)
    const models = await fireworks.getModels()

    this.logger.info('Models fetched successfully, count:', models.length)

    this.modelsCache = models
    this.cacheExpiry = Date.now() + this.CACHE_DURATION

    return models
  }

  clearCache() {
    this.logger.info('Clearing models cache')
    this.modelsCache = null
    this.cacheExpiry = null
  }
} 