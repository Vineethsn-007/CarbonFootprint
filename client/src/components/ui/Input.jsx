import { clsx } from 'clsx'

export function Input({ className, label, error, hint, leftIcon, rightIcon, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[#A1A1AA] font-['JetBrains_Mono',monospace] uppercase tracking-widest"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[#A1A1AA] pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            'flex h-10 w-full rounded-lg border border-[#30354A]',
            'bg-[#1a1e2a] px-3 py-2 text-sm text-white',
            'font-[\'JetBrains_Mono\',monospace]',
            'placeholder:text-[#A1A1AA]/50',
            'focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] focus:border-transparent focus:bg-[#1f2436]',
            'disabled:cursor-not-allowed disabled:opacity-40',
            'transition-all duration-200',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[#A1A1AA]">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-400 mt-0.5 font-['JetBrains_Mono',monospace]">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
          {hint}
        </p>
      )}
    </div>
  )
}

export function Textarea({ className, label, error, hint, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#A1A1AA] font-['JetBrains_Mono',monospace] uppercase tracking-widest">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          'flex min-h-[80px] w-full rounded-lg border border-[#30354A]',
          'bg-[#1a1e2a] px-3 py-2 text-sm text-white resize-none',
          'font-[\'JetBrains_Mono\',monospace]',
          'placeholder:text-[#A1A1AA]/50',
          'focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p role="alert" className="text-xs text-red-400 font-['JetBrains_Mono',monospace]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{hint}</p>}
    </div>
  )
}

export function Select({ className, label, error, id, children, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#A1A1AA] font-['JetBrains_Mono',monospace] uppercase tracking-widest">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={clsx(
          'flex h-10 w-full rounded-lg border border-[#30354A]',
          'bg-[#1a1e2a] px-3 py-2 text-sm text-white',
          'font-[\'JetBrains_Mono\',monospace]',
          'focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p role="alert" className="text-xs text-red-400 font-['JetBrains_Mono',monospace]">{error}</p>}
    </div>
  )
}
