import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ModelSelector from '../ModelSelector'
import { Model } from '@/app/hooks/useModels'

const mockModels: Model[] = [
  { name: 'model-1', title: 'Model One' },
  { name: 'model-2', title: 'Model Two' },
]

describe('ModelSelector Component', () => {
  it('should display "Loading models..." when loading', () => {
    render(
      <ModelSelector
        models={[]}
        selectedModel={null}
        setSelectedModel={vi.fn()}
        isLoading={true}
        error={null}
      />
    )
    expect(screen.getByText('Loading models...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should display "Error loading models" on error', () => {
    render(
      <ModelSelector
        models={[]}
        selectedModel={null}
        setSelectedModel={vi.fn()}
        isLoading={false}
        error={new Error('Test error')}
      />
    )
    expect(screen.getByText('Error loading models')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should display the selected model title', () => {
    render(
      <ModelSelector
        models={mockModels}
        selectedModel={mockModels[0]}
        setSelectedModel={vi.fn()}
        isLoading={false}
        error={null}
      />
    )
    expect(screen.getByText('Model One')).toBeInTheDocument()
  })

  it('should open the listbox and show options on click', async () => {
    const user = userEvent.setup()
    render(
      <ModelSelector
        models={mockModels}
        selectedModel={mockModels[0]}
        setSelectedModel={vi.fn()}
        isLoading={false}
        error={null}
      />
    )

    const listboxButton = screen.getByRole('button')
    await user.click(listboxButton)

    expect(screen.getByText('Model Two')).toBeInTheDocument()
  })

  it('should call setSelectedModel when a new option is clicked', async () => {
    const user = userEvent.setup()
    const setSelectedModelMock = vi.fn()
    render(
      <ModelSelector
        models={mockModels}
        selectedModel={mockModels[0]}
        setSelectedModel={setSelectedModelMock}
        isLoading={false}
        error={null}
      />
    )

    const listboxButton = screen.getByRole('button')
    await user.click(listboxButton)

    const optionTwo = await screen.findByText('Model Two')
    await user.click(optionTwo)

    expect(setSelectedModelMock).toHaveBeenCalledWith(mockModels[1])
  })

  it('should display "Select a model" when no model is selected', () => {
    render(
      <ModelSelector
        models={mockModels}
        selectedModel={null}
        setSelectedModel={vi.fn()}
        isLoading={false}
        error={null}
      />
    )
    expect(screen.getByText('Select a model')).toBeInTheDocument()
  })
}) 