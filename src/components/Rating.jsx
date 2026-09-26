import { Star } from 'lucide-react'

const SIZES = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

/**
 * Accessible star rating display. Renders a precise partial fill (not just
 * whole/half stars) by layering a fully-lit star row under a clipped copy,
 * so e.g. 3.7 reads as three lit stars, a 70%-lit fourth, and a dim fifth.
 */
export default function Rating({ value = 0, count, size = 'md', showCount = true, className = '' }) {
  const clamped = Math.max(0, Math.min(5, Number(value) || 0))
  const pct = (clamped / 5) * 100
  const starClass = SIZES[size] || SIZES.md

  return (
    <div
      className={'inline-flex items-center gap-1.5 ' + className}
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of 5 stars`}
    >
      <div className="relative inline-flex">
        <div className="flex gap-0.5" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={starClass + ' text-stone-300 fill-stone-300'} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden"
          style={{ width: pct + '%' }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={starClass + ' text-brass-500 fill-brass-500 shrink-0'} />
          ))}
        </div>
      </div>
      {showCount && count !== undefined && count !== null && (
        <span className="text-av-caption text-charcoal-400">
          {count > 0 ? `(${count.toLocaleString()})` : 'No reviews'}
        </span>
      )}
    </div>
  )
}
