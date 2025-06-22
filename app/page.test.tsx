import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from './page'

describe('Home Page', () => {
  it('renders the Chat component', () => {
    render(<Home />)
    // The Chat component shows a heading by default
    const heading = screen.getByRole('heading', {
      name: /mini model playground/i,
    })
    expect(heading).toBeInTheDocument()
  })

  it('has the correct main element structure', () => {
    render(<Home />)
    const main = screen.getByRole('main')
    expect(main).toHaveClass('h-screen bg-gray-50')
  })
}) 