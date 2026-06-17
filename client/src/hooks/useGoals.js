import { useState, useEffect, useCallback } from 'react'
import { getUserGoals } from '../services/firestore'
import { useAuth } from '../contexts/AuthContext'

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUserGoals(user.uid)
      setGoals(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    fetchGoals()
  }, [user, fetchGoals])

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0

  return { goals, activeGoals, completedGoals, completionRate, loading, error, refetch: fetchGoals }
}
