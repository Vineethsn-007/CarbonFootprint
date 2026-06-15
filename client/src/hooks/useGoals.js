import { useState, useEffect } from 'react'
import { getUserGoals } from '../services/firestore'
import { useAuth } from '../contexts/AuthContext'

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchGoals()
  }, [user])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const data = await getUserGoals(user.uid)
      setGoals(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0

  return { goals, activeGoals, completedGoals, completionRate, loading, error, refetch: fetchGoals }
}
