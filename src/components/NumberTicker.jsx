import { useEffect, useRef, useState } from 'react'
import useInView from '../hooks/useInView'

/**
 * Animates a numeric KPI from 0 to `value` over `duration`ms once it scrolls
 * into view (mirrors the Motion System's "number counter" spec). Pass a
 * `formatter` to render currency/percent/units — it receives the in-progress
 * float each frame, so it should round as needed.
 */
export default function NumberTicker({
  value,
  duration = 800,
  formatter = (n) => Math.round(n).toLocaleString(),
  as = 'span',
  className = '',
}) {
  const Tag = as
  const [ref, inView] = useInView({ threshold: 0.3 })
  const [display, setDisplay] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView || startedRef.current) return
    startedRef.current = true

    const numericValue = Number(value) || 0

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(numericValue)
      return
    }

    const start = performance.now()
    let raf
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(numericValue * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  return (
    <Tag ref={ref} className={className}>
      {formatter(display)}
    </Tag>
  )
}
