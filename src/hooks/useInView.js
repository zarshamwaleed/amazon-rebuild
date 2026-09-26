import { useEffect, useRef, useState } from 'react'

/**
 * Generic "has this element entered the viewport" hook shared by scroll-reveal
 * and mount-triggered effects (e.g. KPI counters) across the whole app —
 * one IntersectionObserver contract instead of each component re-implementing it.
 */
export default function useInView({ threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once, threshold, rootMargin])

  return [ref, inView]
}
