import { Minus, Plus } from 'lucide-react'

export default function QuantitySelector({ value, onChange, max = 99, disabled }) {
  return (
    <div className="inline-flex items-center border border-stone-300 rounded-lg bg-bone-50 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        className="w-9 h-9 flex items-center justify-center text-charcoal-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-avenzo"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span
        key={value}
        className="w-10 text-center text-sm font-semibold text-charcoal-900 animate-scale-in"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="w-9 h-9 flex items-center justify-center text-charcoal-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-avenzo"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
