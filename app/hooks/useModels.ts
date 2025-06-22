'use client'

import { useState, useEffect } from 'react'

export interface Model {
  name: string
  title: string
  description?: string
}

export function useModels() {
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/models')
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`)
        }
        const modelData: Model[] = await response.json()
        setModels(modelData)
        if (modelData.length > 0) {
          setSelectedModel(modelData[0])
        }
      } catch (err) {
        const fetchError = err instanceof Error ? err : new Error(String(err))
        setError(fetchError)
        console.error('Failed to fetch models:', fetchError)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [])

  return { models, selectedModel, setSelectedModel, isLoading, error }
} 