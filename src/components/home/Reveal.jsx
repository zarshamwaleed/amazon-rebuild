import { useEffect, useRef, useState } from 'react'

const VARIANTS = {
  up: { hidden: 'opacity-0 translate-y-8', shown: 'opacity-100 translate-y-0' },
  scale: { hidden: 'opacity-0 scale-[1.04]', shown: 'opacity-100 scale-100' },
  fade: { hidden: 'opacity-0', shown: 'opacity-100' },
}

/**
 * Reveals children with a restrained fade/transform transition once they
 * enter the viewport (or immediately for above-the-fold content, since it
 * intersects on mount). Reused for hero entrance, image reveal, and
 * section/card scroll-reveal so every "in" animation in the homepage
 * shares one easing curve and duration.
 */
export default function Reveal({
  children,
  as = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  ...props
}) {
  const Tag = as
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  const v = VARIANTS[variant] || VARIANTS.up

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={className + ' ' + (shown ? v.shown : v.hidden)}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '700ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: delay + 'ms',
      }}
      {...props}
    >
      {children}
    </Tag>
  )
}
