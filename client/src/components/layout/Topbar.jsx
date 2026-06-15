import React, { useState } from 'react'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { clsx } from 'clsx'

export default function Topbar({ sidebarCollapsed }) {
  const { profile } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    { id: 1, text: "Great job! Your footprint is 15% lower this month.", time: "2h ago", read: false },
    { id: 2, text: "Don't forget to log your weekend travel.", time: "1d ago", read: true },
  ]

  return (
    <header
      role="banner"
      className={clsx(
        'fixed top-0 right-0 h-16 z-30 flex items-center px-6 gap-4',
        'bg-[#0B0F19]/85 backdrop-blur-xl border-b border-[#30354A]',
        'transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      {/* Page title spacer */}
      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Notifications"
          className="p-2 rounded-lg hover:bg-[#262A34] text-[#A1A1AA] hover:text-white transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#2D8CFF]"
        >
          <Bell className="w-4 h-4" />
          {notifications.some(n => !n.read) && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2D8CFF] shadow-[0_0_6px_rgba(45,140,255,0.8)]"
              aria-hidden="true"
            />
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-3 w-72 bg-[#0B0F19] border border-[#30354A] rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
            <div className="px-4 py-3 border-b border-[#30354A]">
              <h3 className="text-white text-sm font-medium">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className={clsx("px-4 py-3 border-b border-[#30354A]/50 last:border-0 hover:bg-[#262A34] cursor-pointer transition-colors", !n.read && "bg-[#2D8CFF]/5")}>
                  <p className={clsx("text-sm leading-relaxed", n.read ? "text-[#A1A1AA]" : "text-white")}>{n.text}</p>
                  <p className="text-[10px] text-[#A1A1AA] mt-1.5 font-['JetBrains_Mono',monospace] uppercase">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full gradient-eco flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-[0_0_10px_rgba(45,140,255,0.25)] hover:shadow-[0_0_16px_rgba(45,140,255,0.4)] transition-shadow"
        aria-label={`User: ${profile?.displayName || 'User'}`}
        role="img"
      >
        {profile?.displayName?.[0]?.toUpperCase() || 'U'}
      </div>
    </header>
  )
}
