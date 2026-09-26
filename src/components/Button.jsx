import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-charcoal-900 text-bone-50 hover:bg-charcoal-800 active:bg-charcoal-700',
  secondary: 'bg-brass-400 text-charcoal-900 hover:bg-brass-300 active:bg-brass-200',
  outline: 'border border-stone-300 bg-bone-50 text-charcoal-800 hover:bg-stone-100 hover:border-stone-400 active:bg-stone-200',
  ghost: 'bg-transparent text-charcoal-700 hover:bg-stone-100 active:bg-stone-200',
  danger: 'bg-error-500 text-bone-50 hover:bg-error-700 active:bg-error-700 active:brightness-90',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-lg',
}

const ICON_SIZES = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium transition-avenzo select-none ' +
    'active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
  const cls =
    base + ' ' + SIZES[size] + ' ' + (VARIANTS[variant] || VARIANTS.primary) + ' ' + className
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 aria-hidden="true" className={ICON_SIZES[size] + ' animate-spin'} />}
      {children}
    </button>
  )
}
