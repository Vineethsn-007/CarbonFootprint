import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf, ArrowRight, BarChart3, Target, Bot, Trophy,
  BookOpen, Shield, ChevronDown, Star, Users, TrendingDown,
  Zap, Globe, Mail, MessageSquare
} from 'lucide-react'
import Button from '../components/ui/Button'

import { clsx } from 'clsx'
import Orb from '../components/ui/Orb'

const stats = [
  { label: 'Active Users',      value: '12,400+', icon: Users,       color: 'text-[#2D8CFF]' },
  { label: 'CO₂ Tracked',       value: '48,000 kg', icon: TrendingDown, color: 'text-cyan-400' },
  { label: 'Goals Set',         value: '9,300+',  icon: Target,      color: 'text-violet-400' },
  { label: 'Trees Equivalent',  value: '2,200+',  icon: Leaf,        color: 'text-emerald-400' },
]

const features = [
  {
    icon: BarChart3, title: 'Detailed Analytics',
    desc: 'Track your carbon footprint across transportation, energy, food, shopping and waste with beautiful Recharts visualisations.',
    glow: 'rgba(45,140,255,0.12)', border: '#2D8CFF'
  },
  {
    icon: Bot, title: 'AI Carbon Coach',
    desc: 'Gemini-powered assistant analyses your habits and generates a personalised weekly eco plan with measurable CO₂ savings.',
    glow: 'rgba(139,92,246,0.12)', border: '#8b5cf6'
  },
  {
    icon: Target, title: 'Goal Tracking',
    desc: 'Set eco-friendly challenges, track completion progress, and earn points as you achieve milestones.',
    glow: 'rgba(45,140,255,0.12)', border: '#2D8CFF'
  },
  {
    icon: Trophy, title: 'Gamification',
    desc: 'Climb the community leaderboard. Earn badges like Energy Saver, Public Transport Hero, and Sustainability Champion.',
    glow: 'rgba(251,191,36,0.10)', border: '#fbbf24'
  },
  {
    icon: BookOpen, title: 'Education Hub',
    desc: 'Learn about climate change, renewable energy, waste management and sustainable living through curated articles.',
    glow: 'rgba(45,140,255,0.12)', border: '#2D8CFF'
  },
  {
    icon: Shield, title: 'Secure & Private',
    desc: 'Firebase Authentication, Firestore Security Rules, and end-to-end protection keep your data safe.',
    glow: 'rgba(100,116,139,0.10)', border: '#475569'
  },
]

const testimonials = [
  { name: 'Priya S.', role: 'Software Engineer', text: 'EcoTrack\'s AI coach helped me cut my monthly emissions by 28% in just 6 weeks. The weekly eco plan is incredibly practical.', score: 5 },
  { name: 'Arjun M.', role: 'Student', text: 'I had no idea my diet was my biggest carbon source. The calculator breakdown was eye-opening, and the goals keep me motivated.', score: 5 },
  { name: 'Sunita R.', role: 'Product Manager', text: 'The leaderboard makes sustainability fun and competitive. My entire team is now tracking their footprint together.', score: 5 },
]


export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    document.title = 'EcoTrack – Track & Reduce Your Carbon Footprint'
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden">

      {/* Navbar */}
      <nav
        role="navigation"
        aria-label="Main"
        className={clsx(
          'fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 h-16 transition-all duration-300',
          scrolled
            ? 'bg-[#0B0F19]/90 backdrop-blur-xl border-b border-[#30354A]'
            : 'bg-transparent'
        )}
      >
        <Link to="/" className="flex items-center gap-2.5" aria-label="EcoTrack home">
          <img src="/logo.png" alt="EcoTrack Logo" className="h-14 w-auto object-contain drop-shadow-md" />
          <span className="font-bold text-lg text-white nx-display">EcoTrack</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#impact"   className="hover:text-white transition-colors">Impact</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="eco" size="sm" pill>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="gradient-hero min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden">
        
        {/* Orb Background */}
        <div className="absolute inset-0 z-0">
          <Orb
            hoverIntensity={0.5}
            rotateOnHover={true}
            hue={0}
            forceHoverState={false}
            backgroundColor="#0B0F19"
          />
        </div>

        {/* Ambient orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[100px] animate-ambient-glow pointer-events-none"
          style={{ background: 'rgba(45,140,255,0.08)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] animate-ambient-glow pointer-events-none"
          style={{ background: 'rgba(45,140,255,0.06)', animationDelay: '2s' }}
          aria-hidden="true"
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#30354A 1px, transparent 1px), linear-gradient(90deg, #30354A 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
          aria-hidden="true"
        />

        <div className="animate-slide-up max-w-4xl mx-auto relative z-10">
          {/* Pill badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#2D8CFF]/10 text-[#2D8CFF] border border-[#2D8CFF]/25 mb-8 font-['JetBrains_Mono',monospace] tracking-widest uppercase">
            <Zap className="w-3 h-3" />
            Powered by Gemini AI
          </span>

          <h1 className="text-5xl md:text-7xl font-normal leading-[1.04] mb-6 nx-display">
            Track Your
            <span className="block text-transparent" style={{
              backgroundImage: 'linear-gradient(90deg, #2D8CFF 0%, #66b3ff 50%, #a8d4ff 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}>
              Carbon Footprint
            </span>
            Save the Planet
          </h1>

          <p className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed font-['JetBrains_Mono',monospace]">
            Understand your environmental impact, get AI-powered personalised recommendations,
            earn sustainability badges, and join a community committed to a greener future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="eco" size="lg" pill rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Tracking Free
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg">
                See How It Works
              </Button>
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace] tracking-wide">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D8CFF] shadow-[0_0_6px_rgba(45,140,255,0.8)]" aria-hidden="true" />
              FREE FOREVER
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D8CFF] shadow-[0_0_6px_rgba(45,140,255,0.8)]" aria-hidden="true" />
              NO CREDIT CARD
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D8CFF] shadow-[0_0_6px_rgba(45,140,255,0.8)]" aria-hidden="true" />
              AI POWERED
            </span>
          </div>
        </div>

        <a href="#features" className="absolute bottom-8 animate-bounce text-[#A1A1AA]" aria-label="Scroll to features">
          <ChevronDown className="w-5 h-5" />
        </a>
      </section>

      {/* ── Impact Stats ─────────────────────────────────────── */}
      <section id="impact" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-normal mb-3 nx-display">Our Collective Impact</h2>
            <p className="text-[#A1A1AA] font-['JetBrains_Mono',monospace] text-sm">Real numbers from our growing community of eco-warriors</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color }, i) => (
              <div
                key={label}
                className="text-center p-6 rounded-2xl bg-[#262A34] border border-[#30354A] hover:border-[#2D8CFF]/30 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(45,140,255,0.12)] transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Icon className={clsx('w-7 h-7 mx-auto mb-3', color)} aria-hidden="true" />
                <div className="text-2xl font-bold mb-1 text-white font-['JetBrains_Mono',monospace]">{value}</div>
                <div className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace] tracking-wide uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-normal mb-3 nx-display">Everything You Need to Go Green</h2>
            <p className="text-[#A1A1AA] max-w-xl mx-auto font-['JetBrains_Mono',monospace] text-sm">
              A complete sustainability platform — from calculating your footprint to earning rewards for reducing it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, glow, border }, i) => (
              <div
                key={title}
                className="group p-6 rounded-2xl bg-[#262A34] border border-[#30354A] transition-all duration-300 hover:-translate-y-1"
                style={{
                  transitionDelay: `${i * 0.05}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = border + '55'
                  e.currentTarget.style.boxShadow = `0 8px 32px ${glow}`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#30354A'
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: glow, border: `1px solid ${border}33` }}
                >
                  <Icon className="w-5 h-5" style={{ color: border }} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-white font-['JetBrains_Mono',monospace]">{title}</h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed font-['JetBrains_Mono',monospace]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-normal mb-3 nx-display">Loved by Eco Warriors</h2>
            <p className="text-[#A1A1AA] font-['JetBrains_Mono',monospace] text-sm">Join thousands already reducing their footprint</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, score }) => (
              <div
                key={name}
                className="p-6 rounded-2xl bg-[#262A34] border border-[#30354A] hover:border-[#2D8CFF]/30 hover:shadow-[0_8px_32px_rgba(45,140,255,0.1)] transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-4" aria-label={`${score} out of 5 stars`}>
                  {Array.from({ length: score }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4 font-['JetBrains_Mono',monospace]">"{text}"</p>
                <div>
                  <p className="text-sm font-semibold text-white font-['JetBrains_Mono',monospace]">{name}</p>
                  <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #0d2240 0%, #1a3a6e 40%, #1259b8 100%)',
            border: '1px solid rgba(45,140,255,0.3)',
            boxShadow: '0 0 80px rgba(45,140,255,0.2), inset 0 0 80px rgba(45,140,255,0.05)'
          }}>
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-3xl" style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(45,140,255,0.2) 0%, transparent 60%)'
            }} aria-hidden="true" />
            <div className="relative z-10">
              <Globe className="w-12 h-12 text-[#2D8CFF]/80 mx-auto mb-4 animate-spin-slow" aria-hidden="true" />
              <h2 className="text-3xl md:text-4xl font-normal text-white mb-4 nx-display">
                Ready to Make a Difference?
              </h2>
              <p className="text-[#A1A1AA] mb-8 max-w-lg mx-auto font-['JetBrains_Mono',monospace] text-sm leading-relaxed">
                Join 12,400+ people already tracking their carbon footprint and working towards a sustainable future.
              </p>
              <Link to="/register">
                <button
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#2D8CFF] text-white font-semibold text-sm font-['JetBrains_Mono',monospace] hover:bg-[#1a77e8] transition-all duration-200 shadow-[0_0_24px_rgba(45,140,255,0.5)] hover:shadow-[0_0_36px_rgba(45,140,255,0.7)] active:scale-95"
                >
                  Start for Free <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer role="contentinfo" className="border-t border-[#30354A] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="EcoTrack Logo" className="h-12 w-auto object-contain drop-shadow-md" />
                <span className="font-bold text-white nx-display">EcoTrack</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed font-['JetBrains_Mono',monospace]">
                AI-powered carbon footprint awareness platform for a sustainable future.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold mb-4 text-white font-['JetBrains_Mono',monospace] uppercase tracking-widest">Product</h3>
              <ul className="space-y-2 text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold mb-4 text-white font-['JetBrains_Mono',monospace] uppercase tracking-widest">Company</h3>
              <ul className="space-y-2 text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
                <li><a href="#impact" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold mb-4 text-white font-['JetBrains_Mono',monospace] uppercase tracking-widest">Follow Us</h3>
              <div className="flex gap-3">
                <a href="#" aria-label="Community" className="p-2 rounded-lg hover:bg-[#262A34] text-[#A1A1AA] hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Website" className="p-2 rounded-lg hover:bg-[#262A34] text-[#A1A1AA] hover:text-white transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Email" className="p-2 rounded-lg hover:bg-[#262A34] text-[#A1A1AA] hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#30354A] pt-6 text-center text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
            © {new Date().getFullYear()} EcoTrack. Built for a sustainable future. 🌍
          </div>
        </div>
      </footer>
    </div>
  )
}
