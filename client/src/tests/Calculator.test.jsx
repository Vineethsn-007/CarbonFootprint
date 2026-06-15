import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Calculator from '../pages/Calculator'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'test-uid' } }),
}))

vi.mock('../services/firestore', () => ({
  saveEmission: vi.fn().mockResolvedValue('emission-id'),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderCalculator() {
  return render(
    <BrowserRouter>
      <Calculator />
    </BrowserRouter>
  )
}

describe('Carbon Calculator Page', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('renders step 1 (Transportation) on load', () => {
    renderCalculator()
    expect(screen.getByText(/Transportation/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument()
  })

  it('shows progress bar', () => {
    renderCalculator()
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  it('has car km input field', () => {
    renderCalculator()
    expect(screen.getByLabelText(/car travel/i)).toBeInTheDocument()
  })

  it('navigates to next step on Continue click', async () => {
    renderCalculator()
    const continueBtn = screen.getByRole('button', { name: /continue/i })
    fireEvent.click(continueBtn)
    await waitFor(() => {
      expect(screen.getByText(/Step 2 of 5/i)).toBeInTheDocument()
    })
  })

  it('navigates to step 3 (Food) after two continues', async () => {
    renderCalculator()
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => screen.getByText(/Step 2 of 5/i))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => {
      expect(screen.getByText(/Food/i)).toBeInTheDocument()
    })
  })

  it('shows diet options on Food step', async () => {
    renderCalculator()
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      await waitFor(() => {})
    }
    await waitFor(() => {
      expect(screen.getByLabelText(/vegetarian/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/mixed diet/i)).toBeInTheDocument()
    })
  })

  it('shows Back button after first step', async () => {
    renderCalculator()
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /previous step/i })).toBeInTheDocument()
    })
  })
})
