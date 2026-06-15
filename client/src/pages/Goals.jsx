import React, { useState, useEffect } from 'react'
import { Plus, Target, CheckCircle, Clock, Trash2, Edit3, X, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGoals } from '../hooks/useGoals'
import { createGoal, updateGoal, deleteGoal } from '../services/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import Progress from '../components/ui/Progress'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatDate } from '../utils/formatters'

const PRESET_GOALS = [
  { title: 'Use bicycle 3 times/week', description: 'Replace car trips with bicycle for short distances', targetValue: 12, unit: 'trips' },
  { title: 'Reduce electricity by 10%', description: 'Cut monthly electricity consumption by 10%', targetValue: 10, unit: '%' },
  { title: 'Plant 5 trees', description: 'Plant or sponsor 5 trees to offset carbon', targetValue: 5, unit: 'trees' },
  { title: 'Use public transport daily', description: 'Take bus or train instead of car every workday', targetValue: 20, unit: 'days' },
  { title: 'Go meat-free 3 days/week', description: 'Reduce meat consumption to lower food emissions', targetValue: 12, unit: 'days' },
  { title: 'Zero single-use plastic week', description: 'Avoid all single-use plastic for 7 days', targetValue: 7, unit: 'days' },
]

export default function Goals() {
  const { user } = useAuth()
  const { goals, activeGoals, completedGoals, loading, refetch } = useGoals()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', targetValue: 10, unit: 'times', deadline: '' })
  const [progressInputs, setProgressInputs] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = 'Goals – EcoTrack' }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await createGoal(user.uid, { ...form, targetValue: Number(form.targetValue) })
      setShowCreate(false)
      setForm({ title: '', description: '', targetValue: 10, unit: 'times', deadline: '' })
      refetch()
    } finally {
      setSaving(false)
    }
  }

  const handlePreset = async (preset) => {
    setSaving(true)
    try {
      await createGoal(user.uid, { ...preset, deadline: '' })
      refetch()
    } finally {
      setSaving(false)
    }
  }

  const handleProgressUpdate = async (goalId, targetValue) => {
    const val = Number(progressInputs[goalId] || 0)
    const status = val >= targetValue ? 'completed' : 'active'
    await updateGoal(goalId, { currentValue: val, status })
    setProgressInputs((p) => ({ ...p, [goalId]: undefined }))
    refetch()
  }

  const handleDelete = async (goalId) => {
    if (!window.confirm('Delete this goal?')) return
    await deleteGoal(goalId)
    refetch()
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-normal text-white nx-display">Eco Goals</h1>
        <p className="text-sm text-[#A1A1AA] mt-1 font-['JetBrains_Mono',monospace]">
          Set targets and track your sustainability progress
        </p>
      </div>
        <Button
          variant="eco"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreate(true)}
          aria-label="Create new goal"
        >
          New Goal
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',    value: activeGoals.length,    color: 'text-[#2D8CFF]', bg: 'bg-[#2D8CFF]/10' },
          { label: 'Completed',value: completedGoals.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total',    value: goals.length,           color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map(({ label, value, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${color} font-['JetBrains_Mono',monospace]`}>{value}</div>
              <div className="text-xs text-[#A1A1AA] mt-0.5 font-['JetBrains_Mono',monospace] uppercase tracking-wide">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create form modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Create goal">
          <Card className="w-full max-w-md animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Create Goal</CardTitle>
              <button onClick={() => setShowCreate(false)} aria-label="Close dialog" className="p-1.5 rounded-lg hover:bg-[#262A34] text-[#A1A1AA] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input id="goal-title" label="Goal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Cycle 3 times a week" required />
                <Textarea id="goal-desc" label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Why is this goal important to you?" />
                <div className="grid grid-cols-2 gap-3">
                  <Input id="goal-target" label="Target Value" type="number" min="1" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} />
                  <Input id="goal-unit" label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="times, kg, days…" />
                </div>
                <Input id="goal-deadline" label="Deadline (optional)" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button type="submit" variant="eco" className="flex-1" loading={saving}>Create Goal</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const pct = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0
              return (
                <Card key={goal.id} hover>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#2D8CFF]/10 flex items-center justify-center">
                          <Target className="w-4 h-4 text-[#2D8CFF]" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white font-['JetBrains_Mono',monospace]">{goal.title}</p>
                          {goal.deadline && (
                            <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
                              <Clock className="w-3 h-3 inline mr-1" aria-hidden="true" />
                              Due {formatDate(goal.deadline)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(goal.id)} aria-label={`Delete goal: ${goal.title}`} className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {goal.description && (
                      <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{goal.description}</p>
                    )}

                    <Progress value={goal.currentValue} max={goal.targetValue} label={`${goal.currentValue} / ${goal.targetValue} ${goal.unit}`} showValue />

                    {/* Progress update */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="number"
                        min="0"
                        max={goal.targetValue}
                        placeholder={`Update progress (/${goal.targetValue})`}
                        value={progressInputs[goal.id] ?? ''}
                        onChange={(e) => setProgressInputs((p) => ({ ...p, [goal.id]: e.target.value }))}
                        aria-label={`Update progress for ${goal.title}`}
                      className="flex-1 h-8 text-xs px-3 rounded-lg border border-[#30354A] bg-[#1a1e2a] text-white font-['JetBrains_Mono',monospace] focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] placeholder:text-[#A1A1AA]/50"
                      />
                      <Button
                        size="sm"
                        variant="eco"
                        onClick={() => handleProgressUpdate(goal.id, goal.targetValue)}
                        aria-label="Save progress"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white font-['JetBrains_Mono',monospace]">Completed Goals 🎉</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="border-[#2D8CFF]/20 bg-[#2D8CFF]/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-[#2D8CFF] shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-sm text-white font-['JetBrains_Mono',monospace]">{goal.title}</p>
                      <Badge variant="eco" className="mt-1">Completed ✓</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preset goals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white font-['JetBrains_Mono',monospace]">Suggested Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_GOALS.map((preset) => (
            <Card key={preset.title} hover>
              <CardContent className="p-4 space-y-2">
                <p className="font-medium text-sm text-white font-['JetBrains_Mono',monospace]">{preset.title}</p>
                <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{preset.description}</p>
                <p className="text-xs text-[#2D8CFF] font-semibold font-['JetBrains_Mono',monospace]">
                  Target: {preset.targetValue} {preset.unit}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => handlePreset(preset)}
                  loading={saving}
                  aria-label={`Add goal: ${preset.title}`}
                >
                  Add Goal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
