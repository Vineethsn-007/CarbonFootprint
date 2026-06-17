import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Zap, Utensils, ShoppingBag, Trash2, CheckCircle, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { calculateCarbonFootprint, getSustainabilityLevel } from '../utils/carbonCalculator'
import { saveEmission } from '../services/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import Progress from '../components/ui/Progress'
import { formatKgCO2 } from '../utils/formatters'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const STEPS = [
  { id: 'transportation', label: 'Transportation', icon: Car,         color: 'text-[#2D8CFF]',   bg: 'bg-[#2D8CFF]/10' },
  { id: 'energy',        label: 'Energy',          icon: Zap,         color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  { id: 'food',          label: 'Food',            icon: Utensils,    color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'shopping',      label: 'Shopping',        icon: ShoppingBag, color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  { id: 'waste',         label: 'Waste',           icon: Trash2,      color: 'text-[#A1A1AA]',   bg: 'bg-[#A1A1AA]/10' },
]

const DEFAULT_FORM = {
  transportation: { carKmPerWeek: 0, busKmPerWeek: 0, trainKmPerWeek: 0, flightsShortPerYear: 0, flightsLongPerYear: 0, avgFlightDistanceKm: 800, avgFlightDistanceLongKm: 5000 },
  energy: { electricityKwh: 0, gasKgPerMonth: 0, waterLitersPerDay: 150 },
  food: { dietType: 'mixed' },
  shopping: { clothingItemsPerMonth: 0, electronicsItemsPerYear: 0 },
  waste: { plasticKgPerWeek: 0, recycling: true },
}

export default function Calculator() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { document.title = 'Carbon Calculator – EcoTrack' }, [])

  const update = (section, field, value) => {
    setForm((f) => ({ ...f, [section]: { ...f[section], [field]: value } }))
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else handleCalculate()
  }

  const handleCalculate = () => {
    const res = calculateCarbonFootprint(form)
    setResult(res)
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    try {
      await saveEmission(user.uid, { ...result, inputs: form, date: new Date().toISOString() })
      await refreshProfile()
      setSaved(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setForm(DEFAULT_FORM)
    setStep(0)
    setResult(null)
    setSaved(false)
  }

  if (result) {
    return <ResultScreen result={result} onSave={handleSave} onReset={resetForm} saving={saving} saved={saved} />
  }

  const currentStep = STEPS[step]
  const Icon = currentStep.icon

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-normal text-white nx-display">Carbon Footprint Calculator</h1>
        <p className="text-sm text-[#A1A1AA] mt-1 font-['JetBrains_Mono',monospace]">
          Answer a few questions to calculate your monthly CO₂ emissions
        </p>
      </div>

      {/* Step progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{Math.round(((step + 1) / STEPS.length) * 100)}% complete</span>
        </div>
        <Progress value={step + 1} max={STEPS.length} />
        <div className="flex gap-2">
          {STEPS.map((s, i) => {
            const S = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                aria-label={`Go to ${s.label} step`}
                aria-current={i === step ? 'step' : undefined}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all duration-200 font-['JetBrains_Mono',monospace] ${
                i === step
                  ? 'bg-[#2D8CFF]/10 text-[#2D8CFF] border border-[#2D8CFF]/25'
                  : i < step
                  ? 'bg-[#2D8CFF]/5 text-[#2D8CFF]/50'
                  : 'text-[#A1A1AA] hover:bg-[#262A34]'
              }`}
              >
                <S className="w-4 h-4" />
                <span className="hidden sm:block">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Form card */}
      <Card>
        <CardHeader>
          <div className={`w-10 h-10 rounded-xl ${currentStep.bg} flex items-center justify-center mb-2`}>
            <Icon className={`w-5 h-5 ${currentStep.color}`} aria-hidden="true" />
          </div>
          <CardTitle>{currentStep.label}</CardTitle>
          <CardDescription>
            {step === 0 && 'Tell us about your weekly travel habits'}
            {step === 1 && 'Your home energy consumption'}
            {step === 2 && 'Your typical diet and food choices'}
            {step === 3 && 'Your shopping and consumption habits'}
            {step === 4 && 'Your waste and recycling practices'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && <TransportationStep form={form.transportation} update={(f, v) => update('transportation', f, v)} />}
          {step === 1 && <EnergyStep form={form.energy} update={(f, v) => update('energy', f, v)} />}
          {step === 2 && <FoodStep form={form.food} update={(f, v) => update('food', f, v)} />}
          {step === 3 && <ShoppingStep form={form.shopping} update={(f, v) => update('shopping', f, v)} />}
          {step === 4 && <WasteStep form={form.waste} update={(f, v) => update('waste', f, v)} />}

          <div className="flex gap-3 pt-4">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} leftIcon={<ChevronLeft className="w-4 h-4" />} aria-label="Previous step">
                Back
              </Button>
            )}
            <Button
              variant="eco"
              className="flex-1"
              onClick={handleNext}
              rightIcon={step < STEPS.length - 1 ? <ChevronRight className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              aria-label={step < STEPS.length - 1 ? 'Next step' : 'Calculate carbon footprint'}
            >
              {step < STEPS.length - 1 ? 'Continue' : 'Calculate My Footprint'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Step sub-forms ─────────────────────────────────────────────────────────

function TransportationStep({ form, update }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="car-km" label="Car travel (km/week)" type="number" min="0" value={form.carKmPerWeek} onChange={(e) => update('carKmPerWeek', e.target.value === '' ? '' : Number(e.target.value))} hint="Includes petrol/diesel car trips" />
        <Input id="bus-km" label="Bus/public transport (km/week)" type="number" min="0" value={form.busKmPerWeek} onChange={(e) => update('busKmPerWeek', e.target.value === '' ? '' : Number(e.target.value))} />
        <Input id="train-km" label="Train travel (km/week)" type="number" min="0" value={form.trainKmPerWeek} onChange={(e) => update('trainKmPerWeek', e.target.value === '' ? '' : Number(e.target.value))} />
        <Input id="flights-short" label="Short-haul flights (per year)" type="number" min="0" value={form.flightsShortPerYear} onChange={(e) => update('flightsShortPerYear', e.target.value === '' ? '' : Number(e.target.value))} hint="Under 1500 km" />
        <Input id="flights-long" label="Long-haul flights (per year)" type="number" min="0" value={form.flightsLongPerYear} onChange={(e) => update('flightsLongPerYear', e.target.value === '' ? '' : Number(e.target.value))} hint="Over 1500 km" />
      </div>
    </div>
  )
}

function EnergyStep({ form, update }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input id="electricity-kwh" label="Electricity (kWh/month)" type="number" min="0" value={form.electricityKwh} onChange={(e) => update('electricityKwh', e.target.value === '' ? '' : Number(e.target.value))} hint="Check your electricity bill" />
      <Input id="gas-kg" label="LPG/Gas (kg/month)" type="number" min="0" value={form.gasKgPerMonth} onChange={(e) => update('gasKgPerMonth', e.target.value === '' ? '' : Number(e.target.value))} />
      <Input id="water-liters" label="Water consumption (litres/day)" type="number" min="0" value={form.waterLitersPerDay} onChange={(e) => update('waterLitersPerDay', e.target.value === '' ? '' : Number(e.target.value))} hint="Average household: 150 L/day" />
    </div>
  )
}

function FoodStep({ form, update }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {[
          { value: 'vegetarian', label: '🥦 Vegetarian', desc: 'Plant-based diet — lowest carbon impact (~50 kg CO₂/month)', impact: 'Low' },
          { value: 'mixed', label: '🥗 Mixed Diet', desc: 'Combination of meat and plant foods (~120 kg CO₂/month)', impact: 'Medium' },
          { value: 'nonVegetarian', label: '🥩 Non-Vegetarian', desc: 'Regular meat consumption including beef (~200 kg CO₂/month)', impact: 'High' },
        ].map(({ value, label, desc, impact }) => (
          <label
            key={value}
            htmlFor={`diet-${value}`}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
          form.dietType === value
                ? 'border-[#2D8CFF] bg-[#2D8CFF]/10'
                : 'border-[#30354A] hover:border-[#2D8CFF]/40'
            }`}
          >
            <input
              id={`diet-${value}`}
              type="radio"
              name="dietType"
              value={value}
              checked={form.dietType === value}
              onChange={() => update('dietType', value)}
              className="mt-1"
              aria-label={label}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white font-['JetBrains_Mono',monospace]">{label}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  impact === 'Low' ? 'bg-green-500/10 text-green-600' :
                  impact === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-red-500/10 text-red-600'
                }`}>{impact} Impact</span>
              </div>
              <p className="text-sm text-[#A1A1AA] mt-0.5 font-['JetBrains_Mono',monospace]">{desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

function ShoppingStep({ form, update }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input id="clothing-items" label="Clothing items purchased (per month)" type="number" min="0" value={form.clothingItemsPerMonth} onChange={(e) => update('clothingItemsPerMonth', e.target.value === '' ? '' : Number(e.target.value))} hint="Each item ~15 kg CO₂" />
      <Input id="electronics-items" label="Electronics purchased (per year)" type="number" min="0" value={form.electronicsItemsPerYear} onChange={(e) => update('electronicsItemsPerYear', e.target.value === '' ? '' : Number(e.target.value))} hint="Each device ~70 kg CO₂" />
    </div>
  )
}

function WasteStep({ form, update }) {
  return (
    <div className="space-y-4">
      <Input id="plastic-kg" label="Plastic waste (kg/week)" type="number" min="0" step="0.1" value={form.plasticKgPerWeek} onChange={(e) => update('plasticKgPerWeek', e.target.value === '' ? '' : Number(e.target.value))} hint="Estimate from packaging, bottles, etc." />
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#30354A] cursor-pointer hover:border-[#2D8CFF]/40 transition-colors">
        <input
          id="recycling-toggle"
          type="checkbox"
          checked={form.recycling}
          onChange={(e) => update('recycling', e.target.checked)}
          className="w-4 h-4 accent-[#2D8CFF]"
          aria-label="I actively recycle household waste"
        />
        <div>
          <p className="font-medium text-sm text-white font-['JetBrains_Mono',monospace]">I actively recycle household waste</p>
          <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">Reduces waste emissions by ~15%</p>
        </div>
      </label>
    </div>
  )
}

// ─── Result Screen ───────────────────────────────────────────────────────────

const PIE_COLORS = ['#2D8CFF', '#66b3ff', '#a8d4ff', '#8b5cf6', '#475569']

function ResultScreen({ result, onSave, onReset, saving, saved }) {
  const level = getSustainabilityLevel(result.sustainabilityScore)
  const pieData = [
    { name: 'Transportation', value: result.transportation },
    { name: 'Energy', value: result.energy },
    { name: 'Food', value: result.food },
    { name: 'Shopping', value: result.shopping },
    { name: 'Waste', value: result.waste },
  ].filter((d) => d.value > 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <h1 className="text-2xl font-normal text-white nx-display">Your Carbon Footprint Results</h1>

      {/* Score card */}
      <Card className="border-[#2D8CFF]/20" style={{ background: 'linear-gradient(135deg, #0d2240 0%, #1259b8 100%)' }}>
        <CardContent className="p-6 text-center">
          <div className="text-5xl font-bold mb-2 text-white font-['JetBrains_Mono',monospace]">{formatKgCO2(result.totalKgCO2)}</div>
          <p className="text-[#A1A1AA] mb-4 font-['JetBrains_Mono',monospace]">Monthly CO₂ emissions</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: `${level.color}20`, color: level.color }}>
            <span aria-hidden="true">🌍</span>
            {level.label} — {level.rank}
          </div>
          <div className="mt-4">
            <Progress value={result.sustainabilityScore} max={100} label="Sustainability Score" showValue color={result.sustainabilityScore >= 60 ? 'green' : result.sustainabilityScore >= 40 ? 'yellow' : 'red'} />
          </div>
          <p className="text-xs text-[#A1A1AA] mt-3 font-['JetBrains_Mono',monospace]">
            Global average: ~800 kg/month · India average: ~150 kg/month · Paris target: ~83 kg/month
          </p>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card>
        <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} kg CO₂`]} contentStyle={{ background: '#262A34', border: '1px solid #30354A', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3 w-full">
              {pieData.map(({ name, value }, i) => (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-white font-['JetBrains_Mono',monospace]">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_COLORS[i] }} aria-hidden="true" />
                      {name}
                    </span>
                    <span className="font-medium text-white font-['JetBrains_Mono',monospace]">{value} kg CO₂</span>
                  </div>
                  <Progress value={value} max={result.totalKgCO2} color={['blue', 'yellow', 'green', 'purple', 'green'][i]} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset} leftIcon={<RotateCcw className="w-4 h-4" />} aria-label="Recalculate">
          Recalculate
        </Button>
        <Button
          variant="eco"
          className="flex-1"
          onClick={onSave}
          loading={saving}
          disabled={saved}
          leftIcon={saved ? <CheckCircle className="w-4 h-4" /> : null}
          aria-label="Save results and go to dashboard"
        >
          {saved ? 'Saved! Redirecting…' : 'Save & View Dashboard'}
        </Button>
      </div>
    </div>
  )
}
