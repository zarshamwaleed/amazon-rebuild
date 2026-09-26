import { useMemo, useRef, useState } from 'react'

const PAD_X = 8
const PAD_TOP = 16
const PAD_BOTTOM = 28

/**
 * A single-series area/line chart — no external chart library.
 * Follows the Avenzo chart language: one brass line, minimal gridlines,
 * a hover crosshair + tooltip, and a labeled empty state.
 */
export default function MiniSalesChart({ data = [], height = 220, formatValue }) {
  const wrapRef = useRef(null)
  const [hover, setHover] = useState(null) // index into data
  const width = 700 // viewBox width; scales responsively via the SVG's own width:100%

  const fmt = formatValue || ((v) => '$' + Number(v || 0).toFixed(0))

  const { path, fillPath, points, gridLines } = useMemo(() => {
    if (!data.length) return { path: '', fillPath: '', points: [], gridLines: [] }

    const max = Math.max(...data.map((d) => d.value), 1)
    const w = width - PAD_X * 2
    const h = height - PAD_TOP - PAD_BOTTOM
    const step = data.length > 1 ? w / (data.length - 1) : 0

    const points = data.map((d, i) => ({
      x: PAD_X + i * step,
      y: PAD_TOP + h - (d.value / max) * h,
      label: d.label,
      value: d.value,
    }))

    const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ')
    const fillPath = path + ` L ${PAD_X + w} ${PAD_TOP + h} L ${PAD_X} ${PAD_TOP + h} Z`

    // 3 horizontal gridlines (25/50/75% — restrained, not a full grid)
    const gridLines = [0.25, 0.5, 0.75].map((f) => PAD_TOP + h * (1 - f))

    return { path, fillPath, points, gridLines }
  }, [data, height])

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-stone-50 border border-dashed border-stone-200 text-body-sm"
        style={{ height }}
      >
        No sales data yet — this fills in once you make your first sale.
      </div>
    )
  }

  function handleMove(e) {
    const rect = wrapRef.current.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * width
    let nearest = 0
    let nearestDist = Infinity
    points.forEach((p, i) => {
      const d = Math.abs(p.x - relX)
      if (d < nearestDist) {
        nearestDist = d
        nearest = i
      }
    })
    setHover(nearest)
  }

  const active = hover != null ? points[hover] : null

  return (
    <div className="w-full">
      <div
        ref={wrapRef}
        className="relative w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="sellerSalesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AD8232" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#AD8232" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridLines.map((y, i) => (
            <line key={i} x1={PAD_X} x2={width - PAD_X} y1={y} y2={y} stroke="#E5DDD1" strokeWidth="1" />
          ))}

          <path d={fillPath} fill="url(#sellerSalesGrad)" />
          <path d={path} fill="none" stroke="#AD8232" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {active && (
            <line
              x1={active.x}
              x2={active.x}
              y1={PAD_TOP}
              y2={height - PAD_BOTTOM}
              stroke="#9C8B74"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 4.5 : 2.5}
              fill="#8C6928"
              className="transition-avenzo"
            />
          ))}
        </svg>

        {active && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full bg-charcoal-900 text-bone-50 text-xs rounded-lg px-2.5 py-1.5 pointer-events-none shadow-lifted whitespace-nowrap"
            style={{
              left: (active.x / width) * 100 + '%',
              top: (active.y / height) * 100 + '%',
              marginTop: -8,
            }}
          >
            <div className="font-semibold">{fmt(active.value)}</div>
            <div className="text-charcoal-300 text-[10px]">{active.label}</div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-2 text-caption px-1">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}
