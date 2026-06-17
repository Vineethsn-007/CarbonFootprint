import { clsx } from 'clsx'

export function Card({ children, className, hover = false, glass = false, glow = false, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border bg-[#262A34] border-[#30354A]',
        'text-white shadow-sm',
        hover && 'transition-all duration-300 cursor-default',
        hover && 'hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(45,140,255,0.15)] hover:border-[#2D8CFF]/30',
        glass && 'glass-card',
        glow && 'shadow-[0_0_24px_rgba(45,140,255,0.12)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={clsx('flex flex-col space-y-1.5 p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={clsx(
        'font-semibold leading-none tracking-tight text-lg',
        'font-[\'JetBrains_Mono\',monospace] text-white',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={clsx('text-sm text-[#A1A1AA] font-[\'JetBrains_Mono\',monospace]', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={clsx('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={clsx('flex items-center p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}
