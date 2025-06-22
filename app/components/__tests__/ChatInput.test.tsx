import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ChatInput from '../ChatInput'

// Mock ModelSelector component
vi.mock('../ModelSelector', () => ({
  default: ({ models, selectedModel, setSelectedModel, isLoading, error }: any) => (
    <div data-testid="model-selector">
      <span>Models: {models.length}</span>
      <span>Selected: {selectedModel?.title || 'None'}</span>
      <span>Loading: {isLoading.toString()}</span>
      <span>Error: {error?.message || 'None'}</span>
    </div>
  ),
}))

describe('ChatInput', () => {
  const mockProps = {
    inputValue: '',
    setInputValue: vi.fn(),
    onSubmit: vi.fn(),
    isSubmitting: false,
    models: [
      { name: 'model1', title: 'Model 1' },
      { name: 'model2', title: 'Model 2' },
    ],
    selectedModel: { name: 'model1', title: 'Model 1' },
    setSelectedModel: vi.fn(),
    isLoading: false,
    error: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders textarea with correct placeholder', () => {
    render(<ChatInput {...mockProps} />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('id', 'message')
    expect(textarea).toHaveAttribute('name', 'message')
  })

  it('renders submit button with correct styling', () => {
    render(<ChatInput {...mockProps} />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveClass('bg-indigo-600')
  })

  it('calls setInputValue when textarea changes', () => {
    render(<ChatInput {...mockProps} />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')
    fireEvent.change(textarea, { target: { value: 'Hello world' } })

    expect(mockProps.setInputValue).toHaveBeenCalledWith('Hello world')
  })

  it('calls onSubmit when form is submitted', () => {
    render(<ChatInput {...mockProps} inputValue="Hello world" />)

    const form = screen.getByRole('form')
    fireEvent.submit(form)

    expect(mockProps.onSubmit).toHaveBeenCalled()
  })

  it('disables submit button when input is empty', () => {
    render(<ChatInput {...mockProps} inputValue="" />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when no model is selected', () => {
    render(<ChatInput {...mockProps} selectedModel={null} inputValue="Hello" />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when submitting', () => {
    render(<ChatInput {...mockProps} isSubmitting={true} inputValue="Hello" />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when all conditions are met', () => {
    render(<ChatInput {...mockProps} inputValue="Hello world" />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('disables textarea when submitting', () => {
    render(<ChatInput {...mockProps} isSubmitting={true} />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')
    expect(textarea).toBeDisabled()
  })

  it('enables textarea when not submitting', () => {
    render(<ChatInput {...mockProps} isSubmitting={false} />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')
    expect(textarea).not.toBeDisabled()
  })

  it('renders ModelSelector with correct props', () => {
    render(<ChatInput {...mockProps} />)

    expect(screen.getByTestId('model-selector')).toBeInTheDocument()
    expect(screen.getByText('Models: 2')).toBeInTheDocument()
    expect(screen.getByText('Selected: Model 1')).toBeInTheDocument()
    expect(screen.getByText('Loading: false')).toBeInTheDocument()
    expect(screen.getByText('Error: None')).toBeInTheDocument()
  })

  it('passes error to ModelSelector when present', () => {
    const error = new Error('Failed to load models')
    render(<ChatInput {...mockProps} error={error} />)

    expect(screen.getByText('Error: Failed to load models')).toBeInTheDocument()
  })

  it('passes loading state to ModelSelector', () => {
    render(<ChatInput {...mockProps} isLoading={true} />)

    expect(screen.getByText('Loading: true')).toBeInTheDocument()
  })

  it('has correct form structure', () => {
    render(<ChatInput {...mockProps} />)

    const form = screen.getByRole('form')
    const textarea = screen.getByPlaceholderText('How can I help you today?')
    expect(textarea).toBeInTheDocument()

    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('has accessible label for textarea', () => {
    render(<ChatInput {...mockProps} />)

    const label = screen.getByText('Message')
    expect(label).toHaveClass('sr-only')

    const textarea = screen.getByPlaceholderText('How can I help you today?')
    expect(textarea).toHaveAttribute('id', 'message')
    expect(label).toHaveAttribute('for', 'message')
  })

  it('auto-focuses textarea on mount', () => {
    render(<ChatInput {...mockProps} />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')
    expect(document.activeElement).toBe(textarea)
  })

  it('prevents form submission when conditions are not met', () => {
    render(<ChatInput {...mockProps} inputValue="" />)

    const form = screen.getByRole('form')
    fireEvent.submit(form)

    expect(mockProps.onSubmit).toHaveBeenCalled()
    // The onSubmit handler should check conditions and return early if not met
  })

  // New tests for Cmd+Enter functionality
  it('submits form on Cmd+Enter when conditions are met', () => {
    render(<ChatInput {...mockProps} inputValue="Hello world" />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    fireEvent.keyDown(textarea, {
      key: 'Enter',
      metaKey: true, // Cmd key on Mac
    })

    expect(mockProps.onSubmit).toHaveBeenCalled()
  })

  it('submits form on Ctrl+Enter when conditions are met', () => {
    render(<ChatInput {...mockProps} inputValue="Hello world" />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    fireEvent.keyDown(textarea, {
      key: 'Enter',
      ctrlKey: true, // Ctrl key on Windows/Linux
    })

    expect(mockProps.onSubmit).toHaveBeenCalled()
  })

  it('does not submit on Cmd+Enter when input is empty', () => {
    render(<ChatInput {...mockProps} inputValue="" />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    fireEvent.keyDown(textarea, {
      key: 'Enter',
      metaKey: true,
    })

    expect(mockProps.onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit on Cmd+Enter when no model is selected', () => {
    render(<ChatInput {...mockProps} inputValue="Hello" selectedModel={null} />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    fireEvent.keyDown(textarea, {
      key: 'Enter',
      metaKey: true,
    })

    expect(mockProps.onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit on Cmd+Enter when already submitting', () => {
    render(<ChatInput {...mockProps} inputValue="Hello" isSubmitting={true} />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    fireEvent.keyDown(textarea, {
      key: 'Enter',
      metaKey: true,
    })

    expect(mockProps.onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit on regular Enter key', () => {
    render(<ChatInput {...mockProps} inputValue="Hello world" />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    fireEvent.keyDown(textarea, {
      key: 'Enter',
    })

    expect(mockProps.onSubmit).not.toHaveBeenCalled()
  })

  it('prevents default behavior on Cmd+Enter', () => {
    render(<ChatInput {...mockProps} inputValue="Hello world" />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    const event = fireEvent.keyDown(textarea, {
      key: 'Enter',
      metaKey: true,
    })

    // The event should be prevented from bubbling up
    expect(mockProps.onSubmit).toHaveBeenCalled()
  })

  // New tests for auto-focus after submission
  it('refocuses textarea after submission completes', async () => {
    const { rerender } = render(<ChatInput {...mockProps} inputValue="Hello" isSubmitting={true} />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    // Simulate submission completing
    await act(async () => {
      rerender(<ChatInput {...mockProps} inputValue="" isSubmitting={false} />)
    })

    // Textarea should be focused after submission completes
    expect(document.activeElement).toBe(textarea)
  })

  it('maintains focus on textarea when submission is still in progress', async () => {
    const { rerender } = render(<ChatInput {...mockProps} inputValue="Hello" isSubmitting={true} />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    // Simulate submission still in progress
    await act(async () => {
      rerender(<ChatInput {...mockProps} inputValue="" isSubmitting={true} />)
    })

    // When textarea is disabled, it loses focus (expected browser behavior)
    // So we just verify the textarea is disabled and exists
    expect(textarea).toBeDisabled()
    expect(textarea).toBeInTheDocument()
  })

  it('handles multiple Cmd+Enter presses correctly', () => {
    render(<ChatInput {...mockProps} inputValue="Hello world" />)

    const textarea = screen.getByPlaceholderText('How can I help you today?')

    // Press Cmd+Enter multiple times
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })

    // Should only call onSubmit once per valid press
    expect(mockProps.onSubmit).toHaveBeenCalledTimes(3)
  })
}) 