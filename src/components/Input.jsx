import { useState, useId } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function Input({ label, hint, error, loading = false, disabled = false, id, type = 'text', className = '', ...props }) {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const inputId = id || generatedId
  const isPassword = type === 'password'
  const resolvedType = isPassword && visible ? 'text' : type

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-label mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          disabled={disabled || loading}
          className={
            'w-full rounded-lg border bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 ' +
            'transition-avenzo focus:outline-none focus:border-brass-400 ' +
            'disabled:bg-stone-100 disabled:text-charcoal-400 disabled:cursor-not-allowed ' +
            (error ? 'border-error-500 ' : 'border-stone-300 ') +
            (loading || isPassword ? 'pr-9 ' : '') +
            className
          }
          {...props}
        />
        {loading && (
          <Loader2 aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 animate-spin" />
        )}
        {!loading && isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-charcoal-400 hover:text-charcoal-700 transition-avenzo"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-caption mt-1.5">{hint}</p>}
      {error && <p className="text-caption text-error-700 mt-1.5">{error}</p>}
    </div>
  )
}
