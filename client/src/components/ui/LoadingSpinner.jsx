import { clsx } from 'clsx'

export default function LoadingSpinner({ fullScreen = false, size = 'md', className }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const spinner = (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'relative inline-flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      <div className={clsx('absolute rounded-full border-2 border-[#2D8CFF]/20', sizes[size])} />
      <div
        className={clsx(
          'absolute rounded-full border-2 border-transparent border-t-[#2D8CFF] animate-spin',
          sizes[size]
        )}
      />
      <div className="w-1.5 h-1.5 rounded-full bg-[#2D8CFF] animate-pulse" />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0B0F19] z-50 gap-4">
        {spinner}
        <p className="text-sm text-[#A1A1AA] animate-pulse font-['JetBrains_Mono',monospace]">Loading EcoTrack…</p>
      </div>
    )
  }

  return spinner
}
