import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Model, useModels } from '../useModels'

const mockModels: Model[] = [
  { name: 'model-1', title: 'Model One' },
  { name: 'model-2', title: 'Model Two' },
]

describe('useModels Hook', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear()
  })

  it('should initialize with correct default states', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const { result } = renderHook(() => useModels())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.models).toEqual([])
    expect(result.current.selectedModel).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should fetch models and set them correctly on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockModels,
    } as Response)

    const { result } = renderHook(() => useModels())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.models).toEqual(mockModels)
    expect(result.current.selectedModel).toEqual(mockModels[0])
    expect(result.current.error).toBe(null)
    expect(fetch).toHaveBeenCalledWith('/api/models')
  })

  it('should set an error state when the fetch fails', async () => {
    const errorMessage = 'Network Failure'
    vi.mocked(fetch).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useModels())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe(errorMessage)
    expect(result.current.models).toEqual([])
    expect(result.current.selectedModel).toBe(null)
  })

  it('should handle non-ok responses from the API', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response)

    const { result } = renderHook(() => useModels())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toContain('Internal Server Error')
  })

  it('should handle an empty array of models from the API', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const { result } = renderHook(() => useModels())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.models).toEqual([])
    expect(result.current.selectedModel).toBe(null)
  })
}) 