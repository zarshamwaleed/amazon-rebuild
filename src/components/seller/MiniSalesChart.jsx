import { useMemo } from 'react'

/**
 * Simple SVG line chart — no external chart library.
 */
export default function MiniSalesChart({ data = [], width = 700, height = 220 }) {
  const { path, fillPath, points } = useMemo(() => {
    if (!data.length) return { path: '', fillPath: '', points: [] }

    const max = Math.max(...data.map((d) => d.value), 1)
    const pad = 24
    const w = width - pad * 2
    const h = height - pad * 2
    const step = data.length > 1 ? w / (data.length - 1) : 0

    const points = data.map((d, i) => ({
      x: pad + i * step,
      y: pad + h - (d.value / max) * h,
      label: d.label,
      value: d.value,
    }))

    const path = points
      .map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y)
      .join(' ')

    const fillPath =
      path +
      ' L ' +
      (pad + w) +
      ' ' +
      (pad + h) +
      ' L ' +
      pad +
      ' ' +
      (pad + h) +
      ' Z'

    return { path, fillPath, points }
  }, [data, width, height])

  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded text-sm text-gray-500">
        No sales data yet. Sales will appear here once you make your first sale.
      </div>
    )
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#febd69" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#febd69" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#salesGrad)" />
        <path d={path} fill="none" stroke="#c7511f" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#c7511f" />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-gray-500 px-6">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}