import { useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import { useEmissions } from '../hooks/useEmissions'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatKgCO2 } from '../utils/formatters'

const COLORS = ['#2D8CFF', '#66b3ff', '#a8d4ff', '#8b5cf6', '#475569']

const TOOLTIP_STYLE = {
  background: '#262A34',
  border: '1px solid #30354A',
  borderRadius: '12px',
  fontSize: '12px',
  fontFamily: 'JetBrains Mono, monospace',
  color: '#FFFFFF',
}

export default function Analytics() {
  const { emissions, chartData, loading } = useEmissions()

  useEffect(() => { document.title = 'Analytics – EcoTrack' }, [])

  if (loading) return <div className="flex justify-center h-64 items-center"><LoadingSpinner size="lg" /></div>

  // Category stacked data
  const stackedData = chartData.map((d) => ({
    month: d.month,
    Transportation: d.transportation || 0,
    Energy: d.energy || 0,
    Food: d.food || 0,
    Shopping: d.shopping || 0,
    Waste: d.waste || 0,
  }))

  // Average per category (for pie)
  const categoryAverages = emissions.length > 0
    ? [
        { name: 'Transportation', value: Math.round(emissions.reduce((a, e) => a + (e.transportation || 0), 0) / emissions.length) },
        { name: 'Energy', value: Math.round(emissions.reduce((a, e) => a + (e.energy || 0), 0) / emissions.length) },
        { name: 'Food', value: Math.round(emissions.reduce((a, e) => a + (e.food || 0), 0) / emissions.length) },
        { name: 'Shopping', value: Math.round(emissions.reduce((a, e) => a + (e.shopping || 0), 0) / emissions.length) },
        { name: 'Waste', value: Math.round(emissions.reduce((a, e) => a + (e.waste || 0), 0) / emissions.length) },
      ].filter((d) => d.value > 0)
    : []

  const totalAvg = emissions.length > 0
    ? Math.round(emissions.reduce((a, e) => a + (e.totalKgCO2 || 0), 0) / emissions.length)
    : 0

  const maxEmission = emissions.length > 0 ? Math.max(...emissions.map((e) => e.totalKgCO2 || 0)) : 0
  const minEmission = emissions.length > 0 ? Math.min(...emissions.map((e) => e.totalKgCO2 || 0)) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-normal text-white nx-display">Emissions Analytics</h1>
        <p className="text-sm text-[#A1A1AA] mt-1 font-['JetBrains_Mono',monospace]">Deep dive into your carbon footprint data</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Monthly Average', value: formatKgCO2(totalAvg),    color: 'text-[#2D8CFF]' },
          { label: 'Highest Month',   value: formatKgCO2(maxEmission), color: 'text-red-400' },
          { label: 'Lowest Month',    value: formatKgCO2(minEmission), color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-5 text-center">
              <div className={`text-2xl font-bold ${color} mb-1 font-['JetBrains_Mono',monospace]`}>{value}</div>
              <div className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace] uppercase tracking-wide">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Area chart - trend */}
      <Card>
        <CardHeader><CardTitle>CO₂ Emission Trend</CardTitle></CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D8CFF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2D8CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30354A" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A1A1AA', fontFamily: 'JetBrains Mono' }} stroke="#30354A" />
                <YAxis tick={{ fontSize: 11, fill: '#A1A1AA', fontFamily: 'JetBrains Mono' }} stroke="#30354A" />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} kg CO₂`, 'Total']} />
                <Area type="monotone" dataKey="total" stroke="#2D8CFF" strokeWidth={2.5} fill="url(#colorTotal)" dot={{ fill: '#2D8CFF', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </CardContent>
      </Card>

      {/* Stacked bar + pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Category Breakdown by Month</CardTitle></CardHeader>
          <CardContent>
            {stackedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30354A" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A1A1AA', fontFamily: 'JetBrains Mono' }} stroke="#30354A" />
                  <YAxis tick={{ fontSize: 11, fill: '#A1A1AA', fontFamily: 'JetBrains Mono' }} stroke="#30354A" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${v} kg CO₂`, n]} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#A1A1AA' }} />
                  {['Transportation', 'Energy', 'Food', 'Shopping', 'Waste'].map((cat, i) => (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i]} radius={i === 4 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Average Category Distribution</CardTitle></CardHeader>
          <CardContent>
            {categoryAverages.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryAverages} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryAverages.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} kg CO₂`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {categoryAverages.map(({ name, value }, i) => (
                    <div key={name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} aria-hidden="true" />
                      <span className="flex-1 text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{name}</span>
                      <span className="font-medium text-white font-['JetBrains_Mono',monospace]">{value} kg avg</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyChart />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center">
      <span className="text-3xl mb-2" aria-hidden="true">📊</span>
      <p className="text-sm text-[#A1A1AA] font-['JetBrains_Mono',monospace]">No data yet. Complete a carbon calculation to see analytics.</p>
    </div>
  )
}
