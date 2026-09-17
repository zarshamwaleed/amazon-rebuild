export default function QuantitySelector({ value, onChange, max = 99, disabled }) {
  return (
    <div className="inline-flex items-center border border-gray-300 rounded">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="px-4 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
