import useInView from '../hooks/useInView'

const VARIANTS = {
  up: { hidden: 'opacity-0 translate-y-2', shown: 'opacity-100 translate-y-0' },
  scale: { hidden: 'opacity-0 scale-[1.04]', shown: 'opacity-100 scale-100' },
  fade: { hidden: 'opacity-0', shown: 'opacity-100' },
}

/**
 * Site-wide scroll/page-enter reveal primitive: fade (+ optional 8px rise or
 * scale), 400ms ease-out, IntersectionObserver-once at threshold 0.15. Pass
 * `delay` (ms) for per-section stagger. No-ops visually under
 * prefers-reduced-motion (content is shown immediately, unanimated).
 *
 * Distinct from `src/components/home/Reveal.jsx`, which is homepage-specific
 * (different timing/variants tuned for that page) — this one is for the rest
 * of the app.
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
  const [ref, inView] = useInView()
  const v = VARIANTS[variant] || VARIANTS.up

  return (
    <Tag
      ref={ref}
      className={
        className +
        ' motion-reduce:!transition-none motion-reduce:!transform-none motion-reduce:!opacity-100 ' +
        (inView ? v.shown : v.hidden)
      }
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '400ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: delay + 'ms',
      }}
      {...props}
    >
      {children}
    </Tag>
  )
}
