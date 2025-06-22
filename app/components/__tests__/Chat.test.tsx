import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../hooks/useModels', () => ({
  useModels: vi.fn()
}))

vi.mock('../ModelSelector', () => ({
  default: vi.fn(({ models, selectedModel, setSelectedModel, isLoading, error }) => (
    <div data-testid="model-selector">
      {error && <div data-testid="error">{error.message}</div>}
      {isLoading && <div data-testid="loading">Loading...</div>}
      <select
        data-testid="model-select"
        value={selectedModel?.name || ''}
        onChange={(e) => {
          const model = models.find((m: any) => m.name === e.target.value)
          setSelectedModel(model)
        }}
      >
        {models.map((model: any) => (
          <option key={model.name} value={model.name}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  ))
}))

import { useModels } from '../../hooks/useModels'
import Chat from '../Chat'

const mockUseModels = vi.mocked(useModels)

describe('Chat', () => {
  const mockModels = [
    { name: 'model-1', title: 'Model 1' },
    { name: 'model-2', title: 'Model 2' }
  ]

  beforeEach(() => {
    mockUseModels.mockReturnValue({
      models: mockModels,
      selectedModel: mockModels[0],
      setSelectedModel: vi.fn(),
      isLoading: false,
      error: null
    })
  })

  it('renders textarea with correct placeholder', () => {
    render(<Chat />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')
    expect(textarea).toBeInTheDocument()
  })

  it('updates inputValue when user types', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello world' } })

    expect(textarea).toHaveValue('Hello world')
  })

  it('disables submit button when input is empty', () => {
    render(<Chat />)

    const submitButton = screen.getByRole('button', { name: '' })
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when input contains only whitespace', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { name: '' })

    fireEvent.change(textarea, { target: { value: '   ' } })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when input has content', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { name: '' })

    fireEvent.change(textarea, { target: { value: 'Hello world' } })
    expect(submitButton).not.toBeDisabled()
  })

  it('renders ModelSelector with correct props', () => {
    const mockSetSelectedModel = vi.fn()
    mockUseModels.mockReturnValue({
      models: mockModels,
      selectedModel: mockModels[0],
      setSelectedModel: mockSetSelectedModel,
      isLoading: false,
      error: null
    })

    render(<Chat />)

    expect(screen.getByTestId('model-selector')).toBeInTheDocument()
  })

  it('shows loading state in ModelSelector', () => {
    mockUseModels.mockReturnValue({
      models: [],
      selectedModel: null,
      setSelectedModel: vi.fn(),
      isLoading: true,
      error: null
    })

    render(<Chat />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('shows error state in ModelSelector', () => {
    const errorMessage = 'Failed to load models'
    mockUseModels.mockReturnValue({
      models: [],
      selectedModel: null,
      setSelectedModel: vi.fn(),
      isLoading: false,
      error: new Error(errorMessage)
    })

    render(<Chat />)

    expect(screen.getByTestId('error')).toHaveTextContent(errorMessage)
  })

  it('has correct accessibility attributes', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('id', 'message')
    expect(textarea).toHaveAttribute('name', 'message')

    const label = screen.getByLabelText('Message')
    expect(label).toBeInTheDocument()
  })

  it('has autofocus prop on textarea', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox')

    expect(textarea).toHaveFocus()
  })

  it('adjusts textarea height based on content', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement

    // Mock scrollHeight
    Object.defineProperty(textarea, 'scrollHeight', {
      value: 100,
      writable: true
    })

    fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } })

    // The useEffect should have run and set the height
    expect(textarea.style.height).toBe('100px')
  })
})