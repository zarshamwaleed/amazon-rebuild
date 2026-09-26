import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import Rating from '../Rating'
import { useWishlist } from '../../context/WishlistContext'
import { formatPrice } from '../../lib/utils'

/**
 * Premium product presentation for the homepage (Editor's Picks, Trending
 * Now). Deliberately separate from the shared ProductCard component used
 * elsewhere in the app — a distinct, borderless editorial treatment.
 */
export default function HomeProductCard({ product, priority = false }) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [imgError, setImgError] = useState(false)
  const [bump, setBump] = useState(false)
  const active = isWishlisted(product?.id)
  const prevActive = useRef(active)

  useEffect(() => {
    if (active !== prevActive.current) {
      prevActive.current = active
      if (active) {
        setBump(true)
        const t = setTimeout(() => setBump(false), 420)
        return () => clearTimeout(t)
      }
    }
  }, [active])

  if (!product) return null

  const hasDiscount = product.old_price && Number(product.old_price) > Number(product.price)

  function handleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <Link to={'/products/' + product.id} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-avenzo duration-slower group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-caption">No image</div>
        )}

        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-charcoal-900/90 text-bone-50 text-av-caption font-medium tracking-wide uppercase px-2.5 py-1 rounded-full">
            Sale
          </span>
        )}

        <button
          onClick={handleWishlist}
          aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-bone-50/90 backdrop-blur-sm flex items-center justify-center shadow-subtle hover:bg-bone-50 transition-avenzo"
        >
          <Heart
            className={
              (bump ? 'animate-bump ' : '') +
              'w-4 h-4 transition-avenzo ' +
              (active ? 'text-brass-600 fill-brass-600' : 'text-charcoal-600')
            }
          />
        </button>
      </div>

      <div className="mt-4 space-y-1">
        {product.brand && (
          <p className="text-av-label uppercase tracking-wide text-charcoal-400">{product.brand}</p>
        )}
        <h3 className="heading-sub line-clamp-1 group-hover:text-brass-700 transition-avenzo">
          {product.title}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-price">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-caption line-through">${Number(product.old_price).toFixed(2)}</span>
            )}
          </div>
          <Rating value={product.rating} count={product.review_count} size="sm" />
        </div>
      </div>
    </Link>
  )
}
