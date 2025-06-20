import { NextResponse } from 'next/server'
import { ModelsService } from '@/app/lib/models/models-service'
import { ConsoleLogger, NoOpLogger } from '@/app/lib/logger'

export async function GET() {
  const logger = process.env.NODE_ENV === 'production' ? new NoOpLogger() : new ConsoleLogger()
  const modelsService = new ModelsService(logger)
  
  try {
    const models = await modelsService.getModels()
    return NextResponse.json(models)
  } catch (error) {
    logger.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}