import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders correctly', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status', { name: /loading/i })
    expect(spinner).toBeInTheDocument()
  })

  it('renders with fullScreen prop', () => {
    render(<LoadingSpinner fullScreen />)
    const text = screen.getByText(/Loading EcoTrack…/i)
    expect(text).toBeInTheDocument()
  })
})
