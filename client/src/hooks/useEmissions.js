import { useState, useEffect } from 'react'
import { getMonthlyEmissions } from '../services/firestore'
import { useAuth } from '../contexts/AuthContext'

export function useEmissions() {
  const { user } = useAuth()
  const [emissions, setEmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchEmissions()
  }, [user])

  const fetchEmissions = async () => {
    try {
      setLoading(true)
      const data = await getMonthlyEmissions(user.uid)
      setEmissions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const latestEmission = emissions[0] || null
  const previousEmission = emissions[1] || null

  const monthlyChange = latestEmission && previousEmission
    ? Math.round(((latestEmission.totalKgCO2 - previousEmission.totalKgCO2) / previousEmission.totalKgCO2) * 100)
    : null

  // Prepare chart data
  const chartData = [...emissions].reverse().map((e) => ({
    month: e.createdAt?.toDate
      ? new Intl.DateTimeFormat('en', { month: 'short' }).format(e.createdAt.toDate())
      : 'N/A',
    total: e.totalKgCO2,
    transportation: e.transportation,
    energy: e.energy,
    food: e.food,
    shopping: e.shopping,
    waste: e.waste,
  }))

  return { emissions, latestEmission, previousEmission, monthlyChange, chartData, loading, error, refetch: fetchEmissions }
}
