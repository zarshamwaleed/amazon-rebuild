import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import Reveal from './Reveal'
import HomeProductCard from './HomeProductCard'
import Rating from '../Rating'
import LoadingSkeleton from '../LoadingSkeleton'
import EmptyState from '../EmptyState'
import { useWishlist } from '../../context/WishlistContext'
import { formatPrice } from '../../lib/utils'

function Spotlight({ product }) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [imgError, setImgError] = useState(false)
  const active = isWishlisted(product.id)
  const hasDiscount = product.old_price && Number(product.old_price) > Number(product.price)

  function handleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-16 lg:mb-20">
      {/* Image is the section's first element and overlaps upward into the
          section above (FeaturedCollections) via negative margin. */}
      <Reveal
        variant="scale"
        className="lg:col-span-7 relative -mt-20 sm:-mt-24 md:-mt-28 z-10"
      >
        <Link to={'/products/' + product.id} className="group relative block aspect-[4/5] lg:aspect-[16/11] overflow-hidden bg-stone-100">
          {product.image_url && !imgError ? (
            <img
              src={product.image_url}
              alt={product.title}
              loading="eager"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-avenzo duration-slower group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-caption">No image</div>
          )}
          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-charcoal-900/90 text-bone-50 text-av-caption font-medium tracking-wide uppercase px-2.5 py-1">
              Sale
            </span>
          )}
          <button
            onClick={handleWishlist}
            aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bone-50/90 backdrop-blur-sm flex items-center justify-center shadow-subtle hover:bg-bone-50 transition-avenzo"
          >
            <Heart className={'w-4 h-4 ' + (active ? 'text-brass-600 fill-brass-600' : 'text-charcoal-600')} />
          </button>
        </Link>
      </Reveal>

      <div className="lg:col-span-5 lg:pt-10">
        <p className="font-mono text-[0.7rem] text-charcoal-400 tracking-[0.1em]">N&deg; 003 &mdash; This Week&rsquo;s Entry</p>
        {product.brand && (
          <p className="text-av-label uppercase tracking-wide text-charcoal-400 mt-3">{product.brand}</p>
        )}
        <h3 className="font-display text-3xl sm:text-4xl text-charcoal-900 font-medium leading-tight mt-1">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-body mt-4 max-w-md line-clamp-3">{product.description}</p>
        )}

        {/* Dramatic scale contrast — the price is the loudest thing in the section */}
        <div className="flex items-baseline gap-5 flex-wrap mt-8">
          <span className="font-display text-5xl sm:text-6xl text-charcoal-900 tracking-tight">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-caption line-through">${Number(product.old_price).toFixed(2)}</span>
          )}
        </div>
        <Rating value={product.rating} count={product.review_count} className="mt-3" />

        <Link
          to={'/products/' + product.id}
          className="group inline-flex items-baseline gap-2 mt-8 font-display italic text-lg text-charcoal-900 border-b border-charcoal-900/30 pb-1 hover:border-charcoal-900 transition-avenzo"
        >
          View the piece
          <span aria-hidden="true" className="not-italic text-base transition-transform duration-base group-hover:translate-x-1">
            &rarr;
          </span>
        </Link>
      </div>
    </div>
  )
}

export default function EditorsPicks({ products = [], loading, error, id }) {
  const [featured, ...rest] = products

  return (
    <section id={id} className="pt-0 pb-16 md:pb-24">
      {loading ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-16 lg:mb-20">
            <div className="lg:col-span-7 skeleton-shimmer aspect-[4/5] lg:aspect-[16/11] -mt-20 sm:-mt-24 md:-mt-28" />
            <div className="lg:col-span-5 lg:pt-10 flex flex-col gap-4">
              <div className="skeleton-shimmer h-4 w-24 rounded-md" />
              <div className="skeleton-shimmer h-10 w-4/5 rounded-md" />
              <div className="skeleton-shimmer h-4 w-full rounded-md" />
              <div className="skeleton-shimmer h-4 w-2/3 rounded-md" />
              <div className="skeleton-shimmer h-12 w-40 rounded-lg mt-4" />
            </div>
          </div>
          <LoadingSkeleton count={5} />
        </>
      ) : error ? (
        <EmptyState title="Could not load picks" message={error} />
      ) : !featured ? (
        <EmptyState title="No picks yet" />
      ) : (
        <>
          <Spotlight product={featured} />
          {rest.length > 0 && (
            <>
              <p className="font-mono text-[0.7rem] text-charcoal-400 tracking-[0.1em] mb-6 md:mb-8">
                More From The Edit
              </p>
              <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 md:pb-0 md:grid md:grid-cols-5 md:gap-6">
                {rest.map((p) => (
                  <div key={p.id} className="snap-start shrink-0 w-[70%] sm:w-[42%] md:w-auto">
                    <HomeProductCard product={p} />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
