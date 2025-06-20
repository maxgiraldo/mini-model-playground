import { describe, it, expect } from 'vitest'
import { render, screen } from './lib/test-utils'
import Home from './page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', {
      name: /mini model playground/i,
    })
    
    expect(heading).toBeInTheDocument()
  })

  it('displays the ready for development message', () => {
    render(<Home />)
    
    const message = screen.getByText(/ready for development/i)
    
    expect(message).toBeInTheDocument()
  })

  it('has the correct main element structure', () => {
    render(<Home />)
    
    const main = screen.getByRole('main')
    
    expect(main).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-gray-50')
  })
})