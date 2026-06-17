import { clsx } from 'clsx'

export default function Progress({ value = 0, max = 100, className, label, showValue = false, color = 'blue' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  const colors = {
    blue:   'from-[#2D8CFF] to-[#66b3ff]',
    green:  'from-[#2D8CFF] to-[#66b3ff]',   /* mapped to blue in Nexura */
    cyan:   'from-[#06b6d4] to-[#2D8CFF]',
    yellow: 'from-amber-500 to-amber-400',
    red:    'from-red-500 to-red-400',
    purple: 'from-violet-500 to-purple-400',
  }

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-white font-['JetBrains_Mono',monospace]">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className="h-1.5 w-full rounded-full bg-[#30354A] overflow-hidden"
      >
        <div
          className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out', colors[color] || colors.blue)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
