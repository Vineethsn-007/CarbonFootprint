import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'

export default function Register() {
  const navigate = useNavigate()
  const { register, loginWithGoogle } = useAuth()
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => { document.title = 'Create Account – EcoTrack' }, [])

  const validate = () => {
    const e = {}
    if (!form.displayName.trim()) e.displayName = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError('')
    try {
      await register(form.email, form.password, form.displayName.trim())
      navigate('/dashboard')
    } catch (err) {
      setServerError(
        err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setServerError('')
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch {
      setServerError('Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = [
    '',
    'bg-red-500',
    'bg-amber-500',
    'bg-[#2D8CFF]',
    'bg-emerald-500'
  ][strength]

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-16 right-8 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
           style={{ background: 'rgba(45,140,255,0.07)' }} aria-hidden="true" />
      <div className="absolute bottom-16 left-8 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
           style={{ background: 'rgba(45,140,255,0.05)' }} aria-hidden="true" />
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#30354A 1px, transparent 1px), linear-gradient(90deg, #30354A 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} aria-hidden="true" />

      <div className="w-full max-w-md relative animate-slide-up z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="EcoTrack home">
            <img src="/logo.png" alt="EcoTrack Logo" className="h-24 w-auto object-contain drop-shadow-lg" />
            <span className="text-xl font-bold text-white nx-display">EcoTrack</span>
          </Link>
          <h1 className="text-2xl font-normal mt-5 mb-1 text-white nx-display">Join the movement</h1>
          <p className="text-[#A1A1AA] text-sm font-['JetBrains_Mono',monospace]">Start your sustainability journey today</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {serverError && (
              <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400 font-['JetBrains_Mono',monospace]">
                {serverError}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              loading={googleLoading}
              aria-label="Continue with Google"
              leftIcon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
            >
              Continue with Google
            </Button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-[#30354A]" />
              <span className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">or</span>
              <div className="flex-1 border-t border-[#30354A]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                id="register-name"
                label="Full Name"
                type="text"
                placeholder="Priya Sharma"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                error={errors.displayName}
                leftIcon={<User className="w-4 h-4" />}
                autoComplete="name"
                aria-required="true"
              />
              <Input
                id="register-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                aria-required="true"
              />
              <div className="space-y-1.5">
                <Input
                  id="register-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={errors.password}
                  leftIcon={<Lock className="w-4 h-4" />}
                  autoComplete="new-password"
                  aria-required="true"
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="text-[#A1A1AA] hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {form.password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthColor : 'bg-[#30354A]'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{strengthLabel}</span>
                  </div>
                )}
              </div>
              <Input
                id="register-confirm"
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                error={errors.confirm}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
                aria-required="true"
              />

              <Button type="submit" variant="eco" className="w-full" loading={loading} aria-label="Create account">
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2D8CFF] hover:text-[#66b3ff] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
