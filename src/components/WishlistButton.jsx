import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'

export default function WishlistButton({ product, variant = 'icon', className = '' }) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const active = isWishlisted(product.id)
  const [bump, setBump] = useState(false)
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

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
        className={
          'p-1.5 rounded-full bg-bone-50/90 hover:bg-bone-50 shadow-subtle border border-stone-200 transition-avenzo ' +
          className
        }
      >
        <Heart
          className={
            (bump ? 'animate-bump ' : '') +
            'w-4 h-4 transition-avenzo ' +
            (active ? 'text-brass-600 fill-brass-600' : 'text-charcoal-500')
          }
        />
      </button>
    )
  }

  // Full-width text button variant
  return (
    <button
      onClick={handleClick}
      className={
        'inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-avenzo ' +
        (active
          ? 'border-brass-300 bg-brass-50 text-brass-700 hover:bg-brass-100'
          : 'border-stone-300 bg-bone-50 text-charcoal-700 hover:bg-stone-100') +
        ' ' +
        className
      }
    >
      <Heart
        className={
          (bump ? 'animate-bump ' : '') +
          'w-4 h-4 ' +
          (active ? 'fill-brass-600 text-brass-600' : '')
        }
      />
      {active ? 'In Wishlist' : 'Add to Wishlist'}
    </button>
  )
}
