import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { document.title = 'Reset Password – EcoTrack' }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return setError('Please enter your email address')
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email address')
    setLoading(true)
    setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch {
      setError('Failed to send reset email. Please check the address and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
           style={{ background: 'rgba(45,140,255,0.07)' }} aria-hidden="true" />
      <div className="absolute bottom-16 right-8 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
           style={{ background: 'rgba(45,140,255,0.05)' }} aria-hidden="true" />
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#30354A 1px, transparent 1px), linear-gradient(90deg, #30354A 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} aria-hidden="true" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="EcoTrack home">
            <img src="/logo.png" alt="EcoTrack Logo" className="h-24 w-auto object-contain drop-shadow-lg" />
            <span className="text-xl font-bold text-white nx-display">EcoTrack</span>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#2D8CFF]/10 border border-[#2D8CFF]/25 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-[#2D8CFF]" aria-hidden="true" />
                </div>
                <h1 className="text-xl font-normal text-white nx-display">Check your inbox</h1>
                <p className="text-sm text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
                  We sent a password reset link to <strong className="text-white">{email}</strong>. Check your email and follow the instructions.
                </p>
                <Link to="/login">
                  <Button variant="eco" className="w-full mt-4">Back to Sign In</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-normal mb-1 text-white nx-display">Forgot password?</h1>
                  <p className="text-sm text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                {error && (
                  <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400 font-['JetBrains_Mono',monospace]">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <Input
                    id="forgot-email"
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    autoComplete="email"
                    aria-required="true"
                  />
                  <Button type="submit" variant="eco" className="w-full" loading={loading}>
                    Send Reset Link
                  </Button>
                </form>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1.5 text-sm text-[#A1A1AA] hover:text-white transition-colors font-['JetBrains_Mono',monospace]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
