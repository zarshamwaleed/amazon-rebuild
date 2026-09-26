import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Plus, Check } from 'lucide-react'
import Rating from './Rating'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { getCouponsForProduct } from '../services/couponService'
import { formatPrice } from '../lib/utils'

/**
 * Primary reusable product tile — used everywhere the app lists products
 * (Products, Category, Search, Deals, Wishlist, PublicStore/Seller, related
 * items, recently-viewed, etc.) via ProductGrid. Deliberately separate from
 * the homepage-only HomeProductCard, which has its own editorial treatment.
 */
export default function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { addItem } = useCart()
  const [coupon, setCoupon] = useState(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!product) return
    let cancelled = false
    getCouponsForProduct(product.id)
      .then((list) => {
        if (!cancelled) setCoupon(list[0] || null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [product?.id])

  if (!product) return null

  const active = isWishlisted(product.id)
  const hasDiscount = product.old_price && Number(product.old_price) > Number(product.price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : 0
  const inStock = product.stock > 0

  function handleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  async function handleQuickAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock || adding || added) return
    setAdding(true)
    try {
      await addItem(product, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 1600)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link
      to={'/products/' + product.id}
      className="group relative flex flex-col bg-bone-50 border border-stone-200/80 rounded-xl overflow-hidden transition-all duration-300 ease-out hover:border-stone-300 hover:shadow-card hover:-translate-y-1"
    >
      {/* Image — inset from the card edges so it breathes */}
      <div className="p-2.5 pb-0">
        <div className="relative aspect-square rounded-xl bg-stone-100 overflow-hidden">
          {product.image_url && !imgError ? (
            <img
              src={product.image_url}
              alt={product.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-caption">No image</div>
          )}

          <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5 max-w-[calc(100%-3rem)]">
            {hasDiscount && (
              <span className="bg-brass-500 text-charcoal-900 text-av-caption font-semibold tracking-wide px-2 py-1 rounded-full">
                -{discountPct}%
              </span>
            )}
            {coupon && (
              <span className="bg-charcoal-900/90 text-bone-50 text-av-caption font-semibold tracking-wide px-2 py-1 rounded-full truncate">
                {coupon.discount_type === 'percentage'
                  ? `${Number(coupon.discount_value)}% coupon`
                  : `$${Number(coupon.discount_value)} coupon`}
              </span>
            )}
          </div>

          <button
            onClick={handleWishlist}
            aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
            className="group/wish absolute top-2 right-2 w-8 h-8 rounded-full bg-bone-50/90 backdrop-blur-sm flex items-center justify-center transition-avenzo hover:bg-bone-50 hover:scale-105 active:scale-95"
          >
            <Heart
              className={
                'w-4 h-4 transition-avenzo ' +
                (active ? 'text-brass-600 fill-brass-600' : 'text-charcoal-500 group-hover/wish:text-brass-600')
              }
            />
          </button>

          {/* Quick-add — a full-width ink bar that slides up from the bottom of the image */}
          <button
            onClick={handleQuickAdd}
            disabled={!inStock}
            aria-label={added ? 'Added to cart' : 'Add to cart'}
            className={
              'absolute inset-x-0 bottom-0 h-10 flex items-center justify-center gap-1.5 text-av-caption font-medium uppercase tracking-wide transition-all duration-200 ease-out translate-y-full group-hover:translate-y-0 disabled:opacity-0 disabled:pointer-events-none ' +
              (added ? 'bg-success-500 text-bone-50' : 'bg-charcoal-900 text-bone-50 hover:bg-brass-600')
            }
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <Plus className={'w-3.5 h-3.5 transition-transform duration-fast ' + (adding ? 'scale-75' : '')} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 gap-1.5 p-4">
        {product.brand && (
          <p className="text-[11px] uppercase tracking-wide text-charcoal-400 line-clamp-1">
            {product.brand}
          </p>
        )}
        <h3 className="text-[15px] font-medium text-charcoal-900 line-clamp-2 leading-snug transition-avenzo group-hover:text-brass-700">
          {product.title}
        </h3>

        <Rating value={product.rating} count={product.review_count} size="sm" />

        <div className="mt-auto pt-1.5 flex items-baseline gap-2 flex-wrap">
          <span className="font-display text-[22px] font-medium text-charcoal-900">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-caption line-through">${Number(product.old_price).toFixed(2)}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-av-caption">
          {product.seller_id ? (
            <span className="text-charcoal-400 truncate">
              Sold by <span className="text-charcoal-600 font-medium">Seller</span>
            </span>
          ) : (
            <span />
          )}
          {!inStock && <span className="text-error-500 font-medium shrink-0">Out of stock</span>}
        </div>
      </div>
    </Link>
  )
}
