const FACTS = [
  { k: 'Est.', v: '2014', sub: 'Founded in a single studio' },
  { k: 'Sourcing', v: '40+ makers', sub: 'Vetted for craft, not scale' },
  { k: 'Returns', v: '30 days', sub: 'No questions, no restocking fee' },
  { k: 'Shipping', v: 'Free · $50+', sub: 'Every order, every time' },
]

/**
 * Reframed as a ledger — a ruled fact table — rather than the generic
 * icon-over-headline trust-badge row. No icons; the type carries it.
 */
export default function TrustSection({ id }) {
  return (
    <section id={id} className="py-16 md:py-24 border-t border-stone-200">
      <p className="font-mono text-[0.7rem] text-charcoal-400 tracking-[0.1em] mb-8 md:mb-10">
        N&deg; 006 &mdash; The Ledger
      </p>

      <div className="border-t border-stone-300">
        {FACTS.map((f, i) => (
          <div
            key={f.k}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 sm:py-6 border-b border-stone-300"
          >
            <div className="flex items-baseline gap-4 sm:gap-8 min-w-0">
              <span className="font-mono text-[0.7rem] text-stone-400 w-6 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-av-label uppercase tracking-wide text-charcoal-500 w-24 sm:w-32 shrink-0">
                {f.k}
              </span>
              <span className="font-display italic text-lg sm:text-2xl text-charcoal-900 truncate">
                {f.sub}
              </span>
            </div>
            <span className="font-display text-2xl sm:text-3xl text-charcoal-900 shrink-0">{f.v}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
