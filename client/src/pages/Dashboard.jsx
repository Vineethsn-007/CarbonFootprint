import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingDown, TrendingUp, Zap, Target, Award, ArrowRight,
  Leaf, Car, Utensils, ShoppingBag, Trash2, Calculator
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { useEmissions } from '../hooks/useEmissions'
import { useGoals } from '../hooks/useGoals'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Progress from '../components/ui/Progress'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatKgCO2, getCategoryColor, getRank } from '../utils/formatters'
import { generateInsights } from '../services/gemini'

const PIE_COLORS = ['#2D8CFF', '#66b3ff', '#a8d4ff', '#8b5cf6', '#475569']

export default function Dashboard() {
  const { profile } = useAuth()
  const { latestEmission, chartData, monthlyChange, loading: emLoading } = useEmissions()
  const { activeGoals, completedGoals, loading: goalsLoading } = useGoals()
  const [insights, setInsights] = useState([])
  const [insightsLoading, setInsightsLoading] = useState(false)

  useEffect(() => { document.title = 'Dashboard – EcoTrack' }, [])

  useEffect(() => {
    if (latestEmission && !insights.length) {
      setInsightsLoading(true)
      generateInsights(latestEmission)
        .then(setInsights)
        .catch(() => setInsights([]))
        .finally(() => setInsightsLoading(false))
    }
  }, [latestEmission])

  const score = profile?.sustainabilityScore || 0
  const rank = getRank(score)

  const pieData = latestEmission
    ? [
        { name: 'Transport', value: latestEmission.transportation || 0 },
        { name: 'Energy',    value: latestEmission.energy || 0 },
        { name: 'Food',      value: latestEmission.food || 0 },
        { name: 'Shopping',  value: latestEmission.shopping || 0 },
        { name: 'Waste',     value: latestEmission.waste || 0 },
      ].filter((d) => d.value > 0)
    : []

  if (emLoading || goalsLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal text-white nx-display">
            Good {getGreeting()}, {profile?.displayName ? profile.displayName.split(' ')[0] : 'Eco Warrior'} 🌱
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1 font-['JetBrains_Mono',monospace]">
            Here's your sustainability overview
          </p>
        </div>
        <Link to="/calculator">
          <Button variant="eco" leftIcon={<Calculator className="w-4 h-4" />} aria-label="Calculate new footprint">
            New Calculation
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
        <StatCard
          title="Carbon Score"
          value={`${score}/100`}
          sub={rank.label}
          icon={<Leaf className="w-5 h-5" />}
          color="text-[#2D8CFF]"
          bg="bg-[#2D8CFF]/10"
          badge={<Badge variant="eco">{rank.label}</Badge>}
        />
        <StatCard
          title="This Month"
          value={latestEmission ? formatKgCO2(latestEmission.totalKgCO2) : '—'}
          sub={monthlyChange !== null ? `${monthlyChange > 0 ? '+' : ''}${monthlyChange}% vs last month` : 'No previous data'}
          icon={monthlyChange !== null && monthlyChange < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
          color={monthlyChange !== null && monthlyChange < 0 ? 'text-emerald-400' : 'text-amber-400'}
          bg={monthlyChange !== null && monthlyChange < 0 ? 'bg-emerald-500/10' : 'bg-amber-500/10'}
        />
        <StatCard
          title="Active Goals"
          value={activeGoals.length}
          sub={`${completedGoals.length} completed`}
          icon={<Target className="w-5 h-5" />}
          color="text-[#2D8CFF]"
          bg="bg-[#2D8CFF]/10"
        />
        <StatCard
          title="Sustainability Rating"
          value={score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Needs Work'}
          sub={`Score: ${score}`}
          icon={<Award className="w-5 h-5" />}
          color="text-violet-400"
          bg="bg-violet-500/10"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Emission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30354A" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A1A1AA', fontFamily: 'JetBrains Mono' }} stroke="#30354A" />
                  <YAxis tick={{ fontSize: 11, fill: '#A1A1AA', fontFamily: 'JetBrains Mono' }} stroke="#30354A" />
                  <Tooltip
                    contentStyle={{
                      background: '#262A34',
                      border: '1px solid #30354A',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      color: '#FFFFFF',
                    }}
                    formatter={(v) => [`${v} kg CO₂`, 'Total']}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2D8CFF"
                    strokeWidth={2.5}
                    dot={{ fill: '#2D8CFF', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#66b3ff', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={<BarChart3Icon />}
                title="No emission data yet"
                desc="Complete your first carbon footprint calculation to see trends here."
                action={<Link to="/calculator"><Button variant="eco" size="sm">Calculate Now</Button></Link>}
              />
            )}
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${v} kg CO₂`]}
                      contentStyle={{
                        background: '#262A34',
                        border: '1px solid #30354A',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono',
                        color: '#FFFFFF',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map(({ name, value }, i) => (
                    <div key={name} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} aria-hidden="true" />
                      <span className="flex-1 text-[#A1A1AA] font-['JetBrains_Mono',monospace] text-xs">{name}</span>
                      <span className="font-medium text-white font-['JetBrains_Mono',monospace] text-xs">{value} kg</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="No data" desc="Run a calculation first." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" aria-hidden="true" />
            AI Insights
          </CardTitle>
          <Link to="/assistant" className="text-sm text-[#2D8CFF] hover:text-[#66b3ff] transition-colors flex items-center gap-1 font-['JetBrains_Mono',monospace]">
            Chat with AI <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="flex items-center gap-3 py-4">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-[#A1A1AA] font-['JetBrains_Mono',monospace]">Generating personalised insights…</span>
            </div>
          ) : Array.isArray(insights) && insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.slice(0, 4).map((insight, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#2D8CFF]/5 border border-[#2D8CFF]/15">
                  <div className="flex items-start gap-3">
                    <span className="text-lg" aria-hidden="true">{getCategoryEmoji(insight.category)}</span>
                    <div>
                      <p className="text-sm font-medium mb-1 text-white font-['JetBrains_Mono',monospace]">{insight.title}</p>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed font-['JetBrains_Mono',monospace]">{insight.message}</p>
                      {insight.impact && (
                        <span className="inline-block mt-2 text-xs font-semibold text-[#2D8CFF] bg-[#2D8CFF]/10 px-2 py-0.5 rounded-full font-['JetBrains_Mono',monospace]">
                          💚 {insight.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No insights yet"
              desc="Complete a calculation to get personalised AI recommendations."
              action={<Link to="/calculator"><Button variant="eco" size="sm">Calculate Footprint</Button></Link>}
            />
          )}
        </CardContent>
      </Card>

      {/* Goals preview */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Goals</CardTitle>
            <Link to="/goals" className="text-sm text-[#2D8CFF] hover:text-[#66b3ff] transition-colors flex items-center gap-1 font-['JetBrains_Mono',monospace]">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.slice(0, 3).map((goal) => {
              const pct = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-white font-['JetBrains_Mono',monospace]">{goal.title}</span>
                    <span className="text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{pct}%</span>
                  </div>
                  <Progress value={goal.currentValue} max={goal.targetValue} showValue={false} />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ title, value, sub, icon, color, bg, badge }) {
  return (
    <Card hover>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-6">
          <div className={`p-2 rounded-lg ${bg}`}>
            <span className={color} aria-hidden="true">{icon}</span>
          </div>
          {badge}
        </div>
        <div className="text-2xl font-bold mb-0.5 text-white font-['JetBrains_Mono',monospace]">{value}</div>
        <div className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{sub}</div>
        <div className="text-xs text-[#A1A1AA] mt-1 font-['JetBrains_Mono',monospace] uppercase tracking-wide">{title}</div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="text-center py-8 space-y-2">
      {icon && <div className="text-4xl mb-3" aria-hidden="true">{icon}</div>}
      <p className="font-medium text-white font-['JetBrains_Mono',monospace]">{title}</p>
      <p className="text-sm text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function BarChart3Icon() { return <span aria-hidden="true">📊</span> }

function getCategoryEmoji(cat) {
  return { transportation: '🚗', energy: '⚡', food: '🥗', shopping: '🛍️', waste: '♻️' }[cat] || '🌿'
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
