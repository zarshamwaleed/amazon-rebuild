import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal'
import Rating from '../Rating'
import EmptyState from '../EmptyState'
import { formatPrice } from '../../lib/utils'

function Row({ product, index }) {
  const hasDiscount = product.old_price && Number(product.old_price) > Number(product.price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : 0

  return (
    <Reveal
      as={Link}
      variant="up"
      delay={Math.min(index, 5) * 60}
      to={'/products/' + product.id}
      className="group flex items-center gap-4 sm:gap-5 py-4 border-b border-stone-200"
    >
      <span className="font-display italic text-3xl sm:text-4xl text-stone-300 w-12 sm:w-14 shrink-0 transition-avenzo group-hover:text-brass-500">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="w-14 h-14 sm:w-16 sm:h-16 overflow-hidden bg-stone-100 shrink-0">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-avenzo duration-slower group-hover:scale-110"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {product.brand && (
          <p className="text-av-caption uppercase tracking-wide text-charcoal-400 line-clamp-1">
            {product.brand}
          </p>
        )}
        <h3 className="text-av-body-sm font-medium text-charcoal-800 line-clamp-1 transition-avenzo group-hover:text-brass-700">
          {product.title}
        </h3>
        <Rating value={product.rating} count={product.review_count} size="sm" className="mt-0.5" />
      </div>
      <div className="text-right shrink-0">
        <div className="text-price">{formatPrice(product.price)}</div>
        {hasDiscount && (
          <div className="text-av-caption text-brass-600 font-medium">-{discountPct}%</div>
        )}
      </div>
      <ArrowUpRight className="hidden sm:block w-4 h-4 text-charcoal-300 shrink-0 transition-avenzo group-hover:text-charcoal-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Reveal>
  )
}

export default function TrendingNow({ products = [], loading, error, id }) {
  const mid = Math.ceil(products.length / 2)
  const colA = products.slice(0, mid)
  const colB = products.slice(mid)

  return (
    <section id={id} className="py-16 md:py-24 border-t border-stone-200">
      <div className="flex items-end justify-between mb-10 md:mb-12">
        <div>
          <p className="font-mono text-[0.7rem] text-charcoal-400 tracking-[0.1em]">N&deg; 004</p>
          <h2 className="heading-display-sm mt-2">What everyone&rsquo;s adding to cart</h2>
        </div>
        <Link
          to="/deals"
          className="hidden sm:inline text-body-sm hover:text-charcoal-900 underline decoration-stone-300 underline-offset-4 transition-avenzo"
        >
          See all deals
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-shimmer h-[72px] mb-4" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Could not load trending items" message={error} />
      ) : products.length === 0 ? (
        <EmptyState title="No trending items right now" message="Check back soon." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
          <div>
            {colA.map((p, i) => (
              <Row key={p.id} product={p} index={i} />
            ))}
          </div>
          <div>
            {colB.map((p, i) => (
              <Row key={p.id} product={p} index={mid + i} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
