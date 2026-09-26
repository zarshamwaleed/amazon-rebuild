import { Link } from 'react-router-dom'

/**
 * Closing statement — left-aligned and asymmetric rather than the generic
 * centered-headline-plus-buttons band. A single oversized brand mark bleeds
 * past the section's own bottom edge toward the footer, the page's second
 * deliberate scale-contrast moment (the first is the Editor's Picks price).
 */
export default function BrandPromise() {
  return (
    <section className="relative left-1/2 -translate-x-1/2 w-screen bg-charcoal-900 overflow-visible">
      <div className="relative max-w-[1600px] mx-auto px-6 sm:px-8 pt-20 md:pt-28 pb-24 md:pb-36">
        <div className="max-w-3xl">
          <p className="font-mono text-[0.7rem] text-brass-300/80 tracking-[0.1em]">
            The Avenzo Promise
          </p>

          <h2 className="font-display font-medium text-bone-50 text-4xl sm:text-6xl lg:text-display leading-[1.05] tracking-tight mt-6">
            Nothing ships from Avenzo until we&rsquo;d want it in our own home.
          </h2>

          <p className="text-av-body-lg text-bone-100/75 mt-6 max-w-md">
            That&rsquo;s the whole standard &mdash; no filler, no &ldquo;good enough,&rdquo; no
            exceptions.
          </p>

          <div className="mt-9 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <Link
              to="/products"
              className="group inline-flex items-baseline gap-2 font-display italic text-xl text-bone-50 border-b border-bone-50/40 pb-1 hover:border-bone-50 transition-avenzo"
            >
              Shop the Edit
              <span
                aria-hidden="true"
                className="not-italic transition-transform duration-base group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </Link>
            <Link
              to="/deals"
              className="text-body-sm text-bone-100/70 border-b border-bone-100/20 hover:border-bone-100/60 hover:text-bone-50 pb-1 transition-avenzo"
            >
              See what&rsquo;s trending
            </Link>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="hidden md:block absolute -bottom-10 lg:-bottom-14 right-6 lg:right-10 font-display italic text-charcoal-800/70 text-[6rem] lg:text-[9rem] leading-none tracking-tight select-none pointer-events-none"
        >
          Av.
        </span>
      </div>
    </section>
  )
}
