import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'

export default function Wishlist() {
  const { user } = useAuth()
  const { items, ready } = useWishlist()

  if (!ready) {
    return <div className="py-20 text-center text-sm text-gray-600">Loading wishlist…</div>
  }

  const products = items.map((i) => i.product).filter(Boolean)

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Wishlist</h1>
        <span className="text-sm text-gray-600">
          {products.length} item{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      {!user && products.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-700">
            Your wishlist is saved in this browser. Sign in to keep it across devices.
          </p>
          <div className="flex gap-2">
            <Link
              to="/login"
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 text-sm font-medium px-4 py-1.5 rounded transition"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium px-4 py-1.5 rounded transition"
            >
              Create account
            </Link>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <>
          <EmptyState
            title="Your wishlist is empty"
            message="Tap the heart icon on any product to save it here."
          />
          <div className="text-center mt-6">
            <Link
              to="/products"
              className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2.5 rounded transition"
            >
              Browse products
            </Link>
          </div>
        </>
      ) : (
        <ProductGrid products={products} cols={4} />
      )}
    </div>
  )
}
