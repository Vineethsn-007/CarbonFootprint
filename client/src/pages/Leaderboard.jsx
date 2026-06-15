import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Crown, TrendingDown, Leaf } from 'lucide-react'
import { getLeaderboard } from '../services/firestore'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getRank } from '../utils/formatters'
import { clsx } from 'clsx'

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = 'Leaderboard – EcoTrack'
    setLoading(true)
    setError(null)
    getLeaderboard(20)
      .then(setLeaders)
      .catch((err) => {
        console.error('Leaderboard fetch error:', err)
        setError('Failed to load leaderboard. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  const top3 = leaders.slice(0, 3)
  const rest = leaders.slice(3)
  const myRank = leaders.findIndex((l) => l.id === user?.uid)

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" aria-label="1st place" />
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" aria-label="2nd place" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" aria-label="3rd place" />
    return <span className="text-sm font-bold text-[hsl(var(--muted-foreground))] w-5 text-center" aria-label={`${rank}th place`}>#{rank}</span>
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><LoadingSpinner size="lg" /></div>
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <Trophy className="w-12 h-12 text-amber-500/40" />
      <p className="font-medium text-red-500">{error}</p>
      <button
        onClick={() => { setLoading(true); setError(null); getLeaderboard(20).then(setLeaders).catch((err) => { setError('Failed to load leaderboard. Please try again.'); console.error(err) }).finally(() => setLoading(false)) }}
        className="text-sm text-green-600 dark:text-green-400 underline hover:no-underline"
      >Try again</button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-normal text-white nx-display flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" aria-hidden="true" />
          Community Leaderboard
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-1 font-['JetBrains_Mono',monospace]">
          Rankings based on sustainability score. Keep reducing to climb higher!
        </p>
      </div>

      {/* My rank banner */}
      {myRank >= 0 && (
        <div className="p-4 rounded-2xl gradient-eco text-white flex items-center justify-between shadow-[0_0_24px_rgba(45,140,255,0.2)]">
          <div className="flex items-center gap-3">
            <Leaf className="w-5 h-5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-sm font-['JetBrains_Mono',monospace]">Your Rank</p>
              <p className="text-xs text-white/80 font-['JetBrains_Mono',monospace]">Keep up the great work!</p>
            </div>
          </div>
          <div className="text-3xl font-bold font-['JetBrains_Mono',monospace]">#{myRank + 1}</div>
        </div>
      )}

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
        {[top3[1], top3[0], top3[2]].map((leader, i) => {
            if (!leader) return <div key={i} />
            const podiumRank = [2, 1, 3][i]
            const rank = getRank(leader.sustainabilityScore || 0)
            return (
              <div
                key={leader.id}
                className={clsx(
                  'flex flex-col items-center p-4 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-1',
                  podiumRank === 1 && 'border-amber-500/30 bg-amber-500/5 shadow-[0_8px_32px_rgba(251,191,36,0.1)]',
                  podiumRank === 2 && 'border-[#30354A] bg-[#262A34]/50',
                  podiumRank === 3 && 'border-amber-700/20 bg-amber-700/5'
                )}
              >
                <div className="mb-2">{rankIcon(podiumRank)}</div>
                <div className={clsx(
                  'w-12 h-12 rounded-full gradient-eco flex items-center justify-center text-white font-bold text-lg mb-2',
                  podiumRank === 1 && 'w-14 h-14 text-xl shadow-[0_0_16px_rgba(45,140,255,0.3)]'
                )}>
                  {leader.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <p className="font-semibold text-sm truncate max-w-full text-white font-['JetBrains_Mono',monospace]">{leader.displayName || 'User'}</p>
                <p className="text-xs text-[#A1A1AA] mb-1 font-['JetBrains_Mono',monospace]">{rank.label}</p>
                <Badge variant="eco" className="text-xs">{leader.sustainabilityScore || 0} pts</Badge>
              </div>
            )
          })}
        </div>
      )}

      {/* Full rankings table */}
      {leaders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--muted-foreground))] opacity-40" aria-hidden="true" />
            <p className="font-medium">No rankings yet</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Be the first to complete a carbon calculation!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div role="list" aria-label="Leaderboard rankings">
              {leaders.map((leader, index) => {
                const rank = getRank(leader.sustainabilityScore || 0)
                const isMe = leader.id === user?.uid
                return (
                    <div
                    key={leader.id}
                    role="listitem"
                    aria-label={`Rank ${index + 1}: ${leader.displayName}`}
                    className={clsx(
                      'flex items-center gap-4 px-6 py-4 border-b border-[#30354A] last:border-0 transition-colors',
                      isMe ? 'bg-[#2D8CFF]/5' : 'hover:bg-[#30354A]/50'
                    )}
                  >
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {rankIcon(index + 1)}
                    </div>

                    <div className="w-9 h-9 rounded-full gradient-eco flex items-center justify-center text-white text-sm font-bold shrink-0" aria-hidden="true">
                      {leader.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate text-white font-['JetBrains_Mono',monospace]">{leader.displayName || 'Anonymous'}</p>
                        {isMe && <Badge variant="eco" className="text-xs shrink-0">You</Badge>}
                      </div>
                      <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{rank.label}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-[#2D8CFF] font-['JetBrains_Mono',monospace]">
                        {leader.sustainabilityScore || 0}
                      </div>
                      <div className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">pts</div>
                    </div>

                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="text-sm font-medium">
                        {leader.totalEmissions ? `${Math.round(leader.totalEmissions)} kg` : '—'}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">total CO₂</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
