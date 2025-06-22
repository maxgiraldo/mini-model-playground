import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Model, useModels } from '../../hooks/useModels'
import Chat from '../Chat'

interface ModelSelectorProps {
  models: Model[]
  selectedModel: Model | null
  setSelectedModel: (model: Model) => void
  isLoading: boolean
  error: Error | null
}

vi.mock('../../hooks/useModels', () => ({
  useModels: vi.fn(() => ({
    models: [
      { name: 'model-1', title: 'model-1' },
      { name: 'model-2', title: 'model-2' },
    ],
    selectedModel: { name: 'model-1', title: 'model-1' },
    setSelectedModel: vi.fn(),
    isLoading: false,
    error: null,
  })),
}))

const mockUseModels = useModels as import('vitest').Mock

vi.mock('../ModelSelector', () => ({
  default: ({
    models,
    selectedModel,
    setSelectedModel,
    isLoading,
    error,
  }: ModelSelectorProps) => (
    <div data-testid="model-selector">
      <select data-testid="model-select">
        {models.map((model) => (
          <option key={model.name} value={model.name}>
            {model.title}
          </option>
        ))}
      </select>
    </div>
  ),
}))

describe('Chat', () => {
  it('renders textarea with correct placeholder', () => {
    render(<Chat />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')
    expect(textarea).toBeInTheDocument()
  })

  it('updates inputValue when user types', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Hello world' } })

    expect(textarea.value).toBe('Hello world')
  })

  it('disables submit button when input is empty', () => {
    render(<Chat />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when input contains only whitespace', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /send message/i })

    fireEvent.change(textarea, { target: { value: '   ' } })

    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when input has content', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /send message/i })

    fireEvent.change(textarea, { target: { value: 'Hello world' } })

    expect(submitButton).not.toBeDisabled()
  })

  it('renders ModelSelector with correct props', () => {
    render(<Chat />)

    const modelSelector = screen.getByTestId('model-selector')
    expect(modelSelector).toBeInTheDocument()
  })

  it('shows loading state in ModelSelector', () => {
    mockUseModels.mockReturnValue({
      models: [],
      selectedModel: null,
      setSelectedModel: vi.fn(),
      isLoading: true,
      error: null,
    })

    render(<Chat />)

    expect(screen.getByTestId('model-selector')).toBeInTheDocument()
  })

  it('shows error state in ModelSelector', () => {
    mockUseModels.mockReturnValue({
      models: [],
      selectedModel: null,
      setSelectedModel: vi.fn(),
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<Chat />)

    expect(screen.getByTestId('model-selector')).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('id', 'message')
    expect(textarea).toHaveAttribute('name', 'message')

    const label = screen.getByText('Message')
    expect(label).toHaveAttribute('for', 'message')
  })

  it('has autofocus prop on textarea', () => {
    render(<Chat />)

    const textarea = screen.getByRole('textbox')
    expect(document.activeElement).toBe(textarea)
  })

  it('adjusts textarea height based on content', async () => {
    await act(async () => {
      render(<Chat />)
    })

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    const initialHeight = textarea.style.height

    // Mock scrollHeight
    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 100,
    })

    await act(async () => {
      fireEvent.input(textarea, {
        target: {
          value:
            'This is a long line of text that should cause the textarea to resize.',
        },
      })
    })

    // The height should have changed
    expect(textarea.style.height).not.toBe(initialHeight)
    expect(textarea.style.height).toBe('100px')
  })
})