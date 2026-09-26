import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const IMAGE_MAIN =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=85'

/**
 * Scroll-linked parallax: shifts an element vertically based on its distance
 * from viewport-center. No-ops under prefers-reduced-motion.
 */
function useParallax(factor) {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = null
    function measure() {
      raf = null
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const delta = (rect.top + rect.height / 2 - window.innerHeight / 2) * factor
      setOffset(delta)
    }
    function onScroll() {
      if (raf) return
      raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [factor])

  return [ref, offset]
}

/**
 * Asymmetric split hero, deliberately not a centered full-bleed banner:
 * a narrower left column of set type and a wider image column that bleeds
 * to the viewport edge, uncropped by any card frame. The CTA is a text
 * link (matching the rest of the page's "archive entry" voice), not a
 * boxed button.
 */
export default function HomeHero({ categoryCount }) {
  const [imgRef, imgOffset] = useParallax(-0.05)

  return (
    <section className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden bg-bone-100">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
        {/* Text column — unequal width, left-anchored */}
        <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-8 lg:pl-8 lg:pr-10 pt-14 pb-10 lg:py-24">
          <span className="font-mono text-[0.7rem] tracking-[0.15em] text-charcoal-400">
            N&deg; 001 &mdash; SS26
          </span>

          <h1 className="font-display font-medium text-charcoal-900 text-[2.75rem] sm:text-5xl lg:text-display leading-[1.02] tracking-tight mt-5">
            Fewer things.
            <br />
            <span className="italic text-brass-600">Chosen properly.</span>
          </h1>

          <p className="text-av-body-lg text-charcoal-600 mt-7 max-w-sm">
            Avenzo is a considered edit of everyday essentials and rare finds
            &mdash; each one entered into the archive on craft, not trend.
          </p>

          <div className="mt-9">
            <Link
              to="/products"
              className="group inline-flex items-baseline gap-2 font-display italic text-xl text-charcoal-900 border-b border-charcoal-900/30 pb-1 hover:border-charcoal-900 transition-avenzo"
            >
              Enter the Archive
              <span
                aria-hidden="true"
                className="not-italic text-base transition-transform duration-base group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </div>

          {categoryCount ? (
            <p className="mt-10 font-mono text-[0.7rem] text-charcoal-400 uppercase tracking-[0.1em]">
              {String(categoryCount).padStart(2, '0')} collections currently catalogued
            </p>
          ) : null}
        </div>

        {/* Image column — bleeds to the viewport edge, no card frame */}
        <div className="lg:col-span-7 relative min-h-[52vh] sm:min-h-[60vh] lg:min-h-0 overflow-hidden">
          <div
            ref={imgRef}
            style={{ transform: `translateY(${imgOffset}px)` }}
            className="absolute inset-[-8%]"
          >
            <img
              src={IMAGE_MAIN}
              alt="A softly lit corner of a considered, well-appointed home"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal-900/40 to-transparent lg:hidden" />
          <span className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 font-mono text-[0.65rem] tracking-[0.1em] uppercase text-bone-50/90 bg-charcoal-900/40 backdrop-blur-sm px-2.5 py-1">
            Plate I &mdash; Interior Study
          </span>
        </div>
      </div>
    </section>
  )
}
