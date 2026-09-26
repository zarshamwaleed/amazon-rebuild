import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'

export default function Wishlist() {
  const { user } = useAuth()
  const { items, ready } = useWishlist()

  if (!ready) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-brass-500 animate-spin" />
        <p className="text-body-sm">Loading your wishlist…</p>
      </div>
    )
  }

  const products = items.map((i) => i.product).filter(Boolean)

  return (
    <div>
      <div className="mb-8 md:mb-10 animate-fade-in-up">
        <p className="text-av-label uppercase tracking-wide font-medium text-brass-600 mb-1.5 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5" /> Saved for later
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="font-display text-heading-page md:text-display-sm text-charcoal-900">
            Your Wishlist
          </h1>
          <span className="text-av-body-sm text-charcoal-500">
            {products.length} item{products.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {!user && products.length > 0 && (
        <div className="mb-8 bg-brass-50 border border-brass-200 rounded-xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-body-sm text-charcoal-700">
            Your wishlist is saved in this browser. Sign in to keep it safe across devices.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <Link to="/login">
              <Button size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" variant="outline">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Tap the heart icon on any product to save it here for later."
          action={
            <Link to="/products">
              <Button>
                <ShoppingBag className="w-4 h-4" />
                Browse products
              </Button>
            </Link>
          }
        />
      ) : (
        <ProductGrid products={products} cols={4} />
      )}
    </div>
  )
}
