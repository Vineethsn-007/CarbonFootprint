import { clsx } from 'clsx'

const variants = {
  default:     'bg-[#2D8CFF] text-white hover:bg-[#1a77e8] shadow-[0_0_16px_rgba(45,140,255,0.3)]',
  outline:     'border border-[#30354A] bg-transparent hover:bg-[#262A34] text-white',
  ghost:       'bg-transparent hover:bg-[#262A34] text-white',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  secondary:   'bg-[#262A34] text-[#A1A1AA] hover:bg-[#30354A] hover:text-white',
  eco:         'gradient-eco text-white hover:opacity-90 shadow-[0_0_20px_rgba(45,140,255,0.35)]',
  glass:       'glass text-white hover:bg-[#262A34]/80',
  primary:     'bg-[#2D8CFF] text-white hover:bg-[#1a77e8] shadow-[0_0_16px_rgba(45,140,255,0.3)]',
}

const sizes = {
  sm:   'h-8 px-3 text-xs',
  md:   'h-10 px-4 text-sm',
  lg:   'h-12 px-6 text-sm',
  icon: 'h-10 w-10',
}

export default function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  loading,
  leftIcon,
  rightIcon,
  pill = false,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'font-[\'JetBrains_Mono\',monospace]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D8CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]',
        'disabled:pointer-events-none disabled:opacity-40',
        'active:scale-95',
        pill ? 'rounded-full' : 'rounded-lg',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}
