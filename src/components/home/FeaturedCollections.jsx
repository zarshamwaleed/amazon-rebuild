import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal'
import EmptyState from '../EmptyState'

// Bento spans: card 0 is large (2x2), cards 1-2 stack beside it (2x1 each).
// Tiles a 4-col x 2-row grid exactly for the 3 cards we show.
const SPANS = [
  'sm:col-span-2 sm:row-span-2',
  'sm:col-span-2 sm:row-span-1',
  'sm:col-span-2 sm:row-span-1',
]

export default function FeaturedCollections({ categories = [], loading, error, id }) {
  const featured = categories.slice(0, 3)

  return (
    <section id={id} className="py-16 md:py-24">
      <div className="flex items-end justify-between mb-10 md:mb-12">
        <div>
          <p className="font-mono text-[0.7rem] text-charcoal-400 tracking-[0.1em]">N&deg; 002</p>
          <h2 className="heading-display-sm mt-2">The Collections</h2>
        </div>
        <Link
          to="/products"
          className="hidden sm:inline text-body-sm hover:text-charcoal-900 underline decoration-stone-300 underline-offset-4 transition-avenzo"
        >
          View full index
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:grid-rows-2 sm:h-[480px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className={'skeleton-shimmer h-64 sm:h-full ' + SPANS[i]} />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Could not load collections" message={error} />
      ) : featured.length === 0 ? null : (
        <>
          {/* Image plates — hard edges, no card frame; captions live in the index below */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:grid-rows-2 sm:h-[480px]">
            {featured.map((cat, i) => (
              <Reveal
                key={cat.id}
                variant="fade"
                delay={i * 80}
                className={'relative h-64 sm:h-full overflow-hidden bg-stone-100 ' + SPANS[i]}
              >
                <Link to={'/category/' + cat.slug} className="group block w-full h-full">
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale-[15%] transition-avenzo duration-slower group-hover:grayscale-0 group-hover:scale-105"
                    />
                  )}
                </Link>
              </Reveal>
            ))}
          </div>

          {/* The index — every category, as a ledger, not icon tiles */}
          <div className="mt-8 md:mt-10 border-t border-stone-200">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={'/category/' + cat.slug}
                className="group flex items-center justify-between gap-4 sm:gap-6 py-4 sm:py-5 border-b border-stone-200 transition-avenzo hover:pl-2"
              >
                <div className="flex items-baseline gap-4 sm:gap-6 min-w-0">
                  <span className="font-mono text-[0.7rem] text-stone-400 group-hover:text-brass-600 transition-avenzo shrink-0 w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-xl sm:text-2xl text-charcoal-900 group-hover:italic transition-avenzo truncate">
                    {cat.name}
                  </span>
                </div>
                {cat.description && (
                  <span className="hidden md:block text-body-sm text-charcoal-400 truncate max-w-xs shrink">
                    {cat.description}
                  </span>
                )}
                <ArrowUpRight className="w-4 h-4 text-charcoal-300 shrink-0 transition-avenzo group-hover:text-charcoal-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
