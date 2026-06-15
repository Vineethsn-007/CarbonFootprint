import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calculator, BarChart3, Target, Bot,
  BookOpen, Trophy, User, Settings, LogOut, Menu, X,
  Leaf, ChevronLeft, Shield
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { clsx } from 'clsx'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calculator', icon: Calculator,       label: 'Calculator' },
  { to: '/analytics',  icon: BarChart3,        label: 'Analytics' },
  { to: '/goals',      icon: Target,           label: 'Goals' },
  { to: '/assistant',  icon: Bot,              label: 'AI Assistant' },
  { to: '/learn',      icon: BookOpen,         label: 'Learn' },
  { to: '/leaderboard',icon: Trophy,           label: 'Leaderboard' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()
  const { profile, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      aria-label="Main navigation"
      className={clsx(
        'fixed left-0 top-0 h-full z-40 flex flex-col',
        'bg-[#0B0F19] border-r border-[#30354A]',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[#30354A] shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0" aria-label="EcoTrack home">
          <img src="/logo.png" alt="EcoTrack Logo" className="h-14 w-auto object-contain shrink-0 drop-shadow-md" />
          {!collapsed && (
            <span className="font-bold text-base truncate text-white nx-display">
              EcoTrack
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto p-1.5 rounded-lg hover:bg-[#262A34] text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ChevronLeft className={clsx('w-4 h-4 transition-transform duration-300', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="App navigation">
        <ul className="space-y-0.5" role="list">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'font-[\'JetBrains_Mono\',monospace]',
                    active
                      ? 'bg-[#2D8CFF]/10 text-[#2D8CFF] border border-[#2D8CFF]/20'
                      : 'text-[#A1A1AA] hover:bg-[#262A34] hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              </li>
            )
          })}

          {isAdmin && (
            <li>
              <Link
                to="/admin"
                aria-label="Admin Panel"
                aria-current={location.pathname === '/admin' ? 'page' : undefined}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  'font-[\'JetBrains_Mono\',monospace]',
                  location.pathname === '/admin'
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    : 'text-[#A1A1AA] hover:bg-[#262A34] hover:text-white'
                )}
              >
                <Shield className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Admin Panel</span>}
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-[#30354A]" />

      {/* User profile footer */}
      <div className="p-2 space-y-0.5">
        <Link
          to="/profile"
          aria-label="Profile settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#A1A1AA] hover:bg-[#262A34] hover:text-white transition-colors font-['JetBrains_Mono',monospace]"
        >
          <div className="w-6 h-6 rounded-full gradient-eco flex items-center justify-center text-white text-xs font-bold shrink-0">
            {profile?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {profile?.displayName || 'User'}
              </p>
              <p className="text-xs text-[#A1A1AA] truncate">
                Score: {profile?.sustainabilityScore || 0}
              </p>
            </div>
          )}
        </Link>

        <button
          onClick={handleLogout}
          aria-label="Sign out"
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#A1A1AA] hover:bg-red-500/10 hover:text-red-400 transition-colors font-['JetBrains_Mono',monospace]"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
