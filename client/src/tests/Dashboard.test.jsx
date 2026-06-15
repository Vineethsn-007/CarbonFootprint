import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'

// Mock all external dependencies
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-uid' },
    profile: { displayName: 'Priya Test', sustainabilityScore: 72, email: 'priya@test.com' },
  }),
}))

vi.mock('../hooks/useEmissions', () => ({
  useEmissions: () => ({
    latestEmission: {
      totalKgCO2: 320,
      transportation: 120,
      energy: 80,
      food: 50,
      shopping: 50,
      waste: 20,
    },
    chartData: [
      { month: 'Jan', total: 380 },
      { month: 'Feb', total: 340 },
      { month: 'Mar', total: 320 },
    ],
    monthlyChange: -5,
    loading: false,
    error: null,
  }),
}))

vi.mock('../hooks/useGoals', () => ({
  useGoals: () => ({
    activeGoals: [
      { id: '1', title: 'Cycle 3x/week', targetValue: 12, currentValue: 6, status: 'active' },
    ],
    completedGoals: [{ id: '2', title: 'Plant trees', status: 'completed' }],
    loading: false,
  }),
}))

vi.mock('../services/gemini', () => ({
  generateInsights: vi.fn().mockResolvedValue([
    { title: 'Reduce car usage', message: 'Try cycling twice a week.', impact: '~50 kg CO₂/year', category: 'transportation', priority: 'high' },
  ]),
}))

function renderDashboard() {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  )
}

describe('Dashboard Page', () => {
  it('renders greeting with user name', () => {
    renderDashboard()
    expect(screen.getByText(/Priya Test/i)).toBeInTheDocument()
  })

  it('renders carbon score card', () => {
    renderDashboard()
    expect(screen.getByText(/Carbon Score/i)).toBeInTheDocument()
    expect(screen.getByText(/72\/100/i)).toBeInTheDocument()
  })

  it('renders monthly emissions', () => {
    renderDashboard()
    expect(screen.getByText(/This Month/i)).toBeInTheDocument()
    expect(screen.getByText(/320/i)).toBeInTheDocument()
  })

  it('renders active goals section', () => {
    renderDashboard()
    expect(screen.getByText(/Active Goals/i)).toBeInTheDocument()
    expect(screen.getByText(/Cycle 3x\/week/i)).toBeInTheDocument()
  })

  it('renders New Calculation button', () => {
    renderDashboard()
    expect(screen.getByRole('button', { name: /new calculation/i })).toBeInTheDocument()
  })

  it('renders Emission Trends heading', () => {
    renderDashboard()
    expect(screen.getByText(/Emission Trends/i)).toBeInTheDocument()
  })

  it('renders AI Insights section', () => {
    renderDashboard()
    expect(screen.getByText(/AI Insights/i)).toBeInTheDocument()
  })
})
