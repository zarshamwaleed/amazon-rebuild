import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'

export default function WishlistButton({ product, variant = 'icon', className = '' }) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const active = isWishlisted(product.id)

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
          'p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm border border-gray-200 transition ' +
          className
        }
      >
        <Heart
          className={'w-4 h-4 ' + (active ? 'text-red-600 fill-red-600' : 'text-gray-600')}
        />
      </button>
    )
  }

  // Full-width text button variant
  return (
    <button
      onClick={handleClick}
      className={
        'inline-flex items-center gap-2 px-3 py-2 rounded border text-sm transition ' +
        (active
          ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50') +
        ' ' +
        className
      }
    >
      <Heart className={'w-4 h-4 ' + (active ? 'fill-red-600 text-red-600' : '')} />
      {active ? 'In Wishlist' : 'Add to Wishlist'}
    </button>
  )
}
