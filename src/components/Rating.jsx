import { Star } from 'lucide-react'

export default function Rating({ value = 0, count, size = 'sm' }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  const starSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={
              starSize +
              ' ' +
              (i <= full
                ? 'text-[#ffa41c] fill-[#ffa41c]'
                : i === full + 1 && half
                ? 'text-[#ffa41c] fill-[#ffa41c] opacity-60'
                : 'text-gray-300')
            }
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-blue-600">{count.toLocaleString()}</span>
      )}
    </div>
  )
}
