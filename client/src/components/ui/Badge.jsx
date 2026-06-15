import React from 'react'
import { clsx } from 'clsx'

const variants = {
  default: 'bg-[#262A34] text-[#A1A1AA] border border-[#30354A]',
  eco:     'bg-[#2D8CFF]/15 text-[#2D8CFF] border border-[#2D8CFF]/30',
  primary: 'bg-[#2D8CFF]/15 text-[#2D8CFF] border border-[#2D8CFF]/30',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  danger:  'bg-red-500/15 text-red-400 border border-red-500/30',
  info:    'bg-[#2D8CFF]/15 text-[#2D8CFF] border border-[#2D8CFF]/30',
  outline: 'border border-[#30354A] text-white',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
}

export default function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
        'text-xs font-semibold font-[\'JetBrains_Mono\',monospace] tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
