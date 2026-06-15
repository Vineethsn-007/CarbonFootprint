import React, { useState, useEffect } from 'react'
import { User, Mail, Shield, Award, Download, Save, Leaf } from 'lucide-react'
import jsPDF from 'jspdf'
import { useAuth } from '../contexts/AuthContext'
import { useEmissions } from '../hooks/useEmissions'
import { useGoals } from '../hooks/useGoals'
import { getUserBadges, updateUserProfile } from '../services/firestore'
import { useTheme } from '../contexts/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Progress from '../components/ui/Progress'
import { BADGE_CONFIG, getRank, formatKgCO2 } from '../utils/formatters'
import { Sun, Moon } from 'lucide-react'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { latestEmission, emissions } = useEmissions()
  const { completedGoals } = useGoals()
  const [badges, setBadges] = useState([])
  const [form, setForm] = useState({ displayName: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    document.title = 'Profile – EcoTrack'
    if (profile) setForm({ displayName: profile.displayName || '', email: profile.email || '' })
    getUserBadges(user?.uid).then(setBadges).catch(() => {})
  }, [profile, user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { displayName: form.displayName })
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    try {
      const doc = new jsPDF()
      const rank = getRank(profile?.sustainabilityScore || 0)
      const now = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

      // Header
      doc.setFillColor(22, 163, 74)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('EcoTrack Sustainability Report', 20, 20)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated: ${now}`, 20, 30)
      doc.text(`User: ${profile?.displayName || user?.email}`, 20, 37)

      // Summary
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary', 20, 58)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Sustainability Score: ${profile?.sustainabilityScore || 0}/100 (${rank.label})`, 20, 70)
      doc.text(`Sustainability Rank: ${rank.label}`, 20, 80)
      doc.text(`Total CO₂ Tracked: ${(profile?.totalEmissions || 0).toFixed(1)} kg`, 20, 90)
      doc.text(`Calculations Completed: ${emissions.length}`, 20, 100)
      doc.text(`Goals Completed: ${completedGoals.length}`, 20, 110)
      doc.text(`Badges Earned: ${badges.length}`, 20, 120)

      // Latest emission breakdown
      if (latestEmission) {
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('Latest Monthly Footprint', 20, 140)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total: ${formatKgCO2(latestEmission.totalKgCO2)}`, 20, 152)
        doc.text(`Transportation: ${latestEmission.transportation} kg CO₂`, 20, 162)
        doc.text(`Energy: ${latestEmission.energy} kg CO₂`, 20, 172)
        doc.text(`Food: ${latestEmission.food} kg CO₂`, 20, 182)
        doc.text(`Shopping: ${latestEmission.shopping} kg CO₂`, 20, 192)
        doc.text(`Waste: ${latestEmission.waste} kg CO₂`, 20, 202)
      }

      // Benchmarks
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Benchmarks', 20, 225)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Global average: ~800 kg CO₂/month', 20, 237)
      doc.text('India average: ~150 kg CO₂/month', 20, 247)
      doc.text('Paris Agreement target: ~83 kg CO₂/month', 20, 257)

      // Footer
      doc.setFillColor(22, 163, 74)
      doc.rect(0, 275, 210, 22, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.text('EcoTrack – AI-Powered Carbon Footprint Awareness Platform', 20, 285)
      doc.text('Track. Reduce. Sustain.', 20, 292)

      doc.save(`ecotrack-report-${now.replace(/ /g, '-')}.pdf`)
    } finally {
      setPdfLoading(false)
    }
  }

  const score = profile?.sustainabilityScore || 0
  const rank = getRank(score)

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-normal text-white nx-display">Profile & Settings</h1>
        <p className="text-sm text-[#A1A1AA] mt-1 font-['JetBrains_Mono',monospace]">Manage your account and sustainability data</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-full gradient-eco flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_24px_rgba(45,140,255,0.3)]" aria-hidden="true">
              {profile?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['JetBrains_Mono',monospace]">{profile?.displayName}</h2>
              <p className="text-sm text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="eco">{rank.label}</Badge>
                <Badge variant="outline">{score}/100 score</Badge>
              </div>
            </div>
          </div>

          {/* Sustainability score */}
          <Progress value={score} max={100} label="Sustainability Score" showValue color={score >= 60 ? 'green' : score >= 40 ? 'yellow' : 'red'} />
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" aria-hidden="true" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              id="profile-name"
              label="Display Name"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              id="profile-email"
              label="Email"
              value={form.email}
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
              hint="Email cannot be changed"
            />
            <Button
              type="submit"
              variant="eco"
              loading={saving}
              leftIcon={saved ? null : <Save className="w-4 h-4" />}
              aria-label="Save profile changes"
            >
              {saved ? '✓ Saved!' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" aria-hidden="true" />
            My Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map((badge) => {
                const config = BADGE_CONFIG[badge.badgeId]
                if (!config) return null
                return (
                  <div key={badge.id} className="flex flex-col items-center p-4 rounded-xl border border-[#30354A] hover:border-[#2D8CFF]/30 transition-colors text-center">
                    <span className="text-3xl mb-2" aria-hidden="true">{config.icon}</span>
                    <p className="text-xs font-semibold text-white font-['JetBrains_Mono',monospace]">{config.label}</p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5 font-['JetBrains_Mono',monospace]">{config.description}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-10 h-10 mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-40" aria-hidden="true" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No badges yet. Complete goals to earn them!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white font-['JetBrains_Mono',monospace]">Theme</p>
              <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">Switch between dark and light mode</p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#30354A] hover:bg-[#262A34] transition-colors text-sm font-medium text-white font-['JetBrains_Mono',monospace]"
            >
              {theme === 'dark' ? <><Sun className="w-4 h-4" /> Light Mode</> : <><Moon className="w-4 h-4" /> Dark Mode</>}
            </button>
          </div>

          <div className="border-t border-[#30354A] pt-4">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              loading={pdfLoading}
              leftIcon={<Download className="w-4 h-4" />}
              aria-label="Download sustainability report PDF"
              className="w-full"
            >
              Download Sustainability Report (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
