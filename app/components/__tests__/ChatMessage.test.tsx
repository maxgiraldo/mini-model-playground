import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ChatMessage, { Message } from '../ChatMessage'

describe('ChatMessage', () => {
  const mockUserMessage: Message = {
    role: 'user',
    content: 'Hello, how are you?',
  }

  const mockAssistantMessage: Message = {
    role: 'assistant',
    content: 'I am doing well, thank you!',
    model: 'Test Model',
    ttft: 150,
    responseTime: 2500,
    tps: 12.5,
  }

  const mockErrorMessage: Message = {
    role: 'assistant',
    content: 'An error occurred while processing your request.',
    isError: true,
  }

  it('renders user message correctly', () => {
    render(<ChatMessage message={mockUserMessage} index={0} />)

    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument()
    const container = screen.getByText('Hello, how are you?').closest('.flex.flex-col')
    expect(container).toHaveClass('items-end')
  })

  it('renders assistant message correctly', () => {
    render(<ChatMessage message={mockAssistantMessage} index={1} />)

    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument()
    const container = screen.getByText('I am doing well, thank you!').closest('.flex.flex-col')
    expect(container).toHaveClass('items-start')
  })

  it('renders error message with correct styling', () => {
    render(<ChatMessage message={mockErrorMessage} index={2} />)

    expect(screen.getByText('An error occurred while processing your request.')).toBeInTheDocument()
    const messageBox = screen.getByText('An error occurred while processing your request.').closest('.max-w-xs')
    expect(messageBox).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('displays metrics for assistant messages', () => {
    render(<ChatMessage message={mockAssistantMessage} index={1} />)

    expect(screen.getByText('Test Model')).toBeInTheDocument()
    expect(screen.getByText('TTFT: 150ms')).toBeInTheDocument()
    expect(screen.getByText('RT: 2.50s')).toBeInTheDocument()
    expect(screen.getByText('TPS: 12.50')).toBeInTheDocument()
  })

  it('does not display metrics for error messages', () => {
    render(<ChatMessage message={mockErrorMessage} index={2} />)

    expect(screen.queryByText(/TTFT:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/RT:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/TPS:/)).not.toBeInTheDocument()
  })

  it('does not display metrics for user messages', () => {
    render(<ChatMessage message={mockUserMessage} index={0} />)

    expect(screen.queryByText(/TTFT:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/RT:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/TPS:/)).not.toBeInTheDocument()
  })

  it('processes think tags correctly', () => {
    const messageWithThinkTags: Message = {
      role: 'assistant',
      content: 'Let me think about this... <think>Processing...</think> Here is my answer.',
    }

    render(<ChatMessage message={messageWithThinkTags} index={3} />)

    expect(screen.getByText(/Let me think about this.../)).toBeInTheDocument()
    expect(screen.getByText(/Here is my answer./)).toBeInTheDocument()
  })

  it('renders markdown content correctly', () => {
    const messageWithMarkdown: Message = {
      role: 'assistant',
      content: 'Here is some **bold** and *italic* text with `code`.',
    }

    render(<ChatMessage message={messageWithMarkdown} index={4} />)

    expect(screen.getByText(/Here is some/)).toBeInTheDocument()
    expect(screen.getByText('bold')).toBeInTheDocument()
    expect(screen.getByText('italic')).toBeInTheDocument()
    expect(screen.getByText('code')).toBeInTheDocument()
  })

  it('handles empty content gracefully', () => {
    const emptyMessage: Message = {
      role: 'assistant',
      content: '',
    }

    render(<ChatMessage message={emptyMessage} index={5} />)

    const messageContainer = screen.getByTestId('message-5')
    expect(messageContainer).toBeInTheDocument()
  })

  it('applies correct prose classes based on message role', () => {
    render(<ChatMessage message={mockUserMessage} index={0} />)
    render(<ChatMessage message={mockAssistantMessage} index={1} />)

    const userProse = screen.getAllByText(/Hello/)[0].closest('.prose')
    const assistantProse = screen.getAllByText(/I am doing well/)[0].closest('.prose')

    expect(userProse).toHaveClass('prose-invert')
    expect(assistantProse).not.toHaveClass('prose-invert')
  })
}) 