import { describe, expect, it } from 'vitest'
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

  it('has the correct main element structure', () => {
    render(<Home />)

    const main = screen.getByRole('main')

    expect(main).toHaveClass('flex flex-col h-screen bg-gray-50')
  })
})