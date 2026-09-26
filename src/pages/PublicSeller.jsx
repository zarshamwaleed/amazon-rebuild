import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Store, ArrowLeft, MapPin } from 'lucide-react'
import { supabase } from '../services/supabase'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'
import Rating from '../components/Rating'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function PublicSeller() {
  const { id } = useParams()
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [{ data: prof }, { data: prods }] = await Promise.all([
          supabase
            .from('seller_profiles')
            .select('user_id, store_name, business_name, business_location, plan, product_categories')
            .eq('user_id', id)
            .maybeSingle(),
          supabase
            .from('products')
            .select('*')
            .eq('seller_id', id)
            .order('created_at', { ascending: false }),
        ])
        if (cancelled) return
        setSeller(prof || { user_id: id, store_name: 'Seller' })
        setProducts(prods || [])
      } catch {
        if (!cancelled) setSeller(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton-shimmer h-4 w-32 rounded-md" />
        <div className="bg-bone-50 border border-stone-200 rounded-2xl shadow-subtle p-6 md:p-10">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="skeleton-shimmer w-16 h-16 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0 space-y-2.5 py-1">
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              <div className="skeleton-shimmer h-7 w-64 rounded-md" />
              <div className="skeleton-shimmer h-3 w-40 rounded-md" />
            </div>
          </div>
        </div>
        <LoadingSkeleton count={8} cols={4} />
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="py-10">
        <EmptyState
          title="Seller not found"
          message="This seller profile doesn't exist or was removed."
        />
        <div className="text-center mt-6">
          <Link to="/products" className="text-body-sm text-brass-700 hover:underline">
            ← Back to products
          </Link>
        </div>
      </div>
    )
  }

  const displayName =
    seller.store_name || seller.business_name || 'Amazon Rebuild Seller'

  // Aggregate a store-level rating from the seller's already-fetched products
  // (no extra query — seller_profiles has no rating column of its own).
  const ratedProducts = products.filter((p) => p.review_count > 0)
  const totalReviews = ratedProducts.reduce((s, p) => s + (p.review_count || 0), 0)
  const avgRating =
    totalReviews > 0
      ? ratedProducts.reduce((s, p) => s + (p.rating || 0) * (p.review_count || 0), 0) /
        totalReviews
      : 0

  return (
    <div className="space-y-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-body-sm text-charcoal-500 hover:text-brass-700 transition-avenzo"
      >
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      {/* Seller header */}
      <div className="bg-bone-50 border border-stone-200 rounded-2xl shadow-subtle p-6 md:p-10 animate-fade-in-up">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-xl bg-charcoal-900 text-brass-400 flex items-center justify-center shrink-0">
            <Store className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-label text-brass-600 mb-1.5">
              {seller.plan === 'professional' ? 'Professional Seller' : 'Seller'}
            </p>
            <h1 className="font-display text-heading-page md:text-display-sm text-charcoal-900 truncate">
              {displayName}
            </h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
              {totalReviews > 0 && <Rating value={avgRating} count={totalReviews} size="sm" />}
              {seller.business_location && (
                <p className="text-body-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                  Ships from {seller.business_location}
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-price-lg">{products.length}</div>
            <div className="text-label mt-0.5">
              Product{products.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {seller.product_categories && seller.product_categories.length > 0 && (
          <div className="mt-6 pt-5 border-t border-stone-200 flex flex-wrap gap-2">
            {seller.product_categories.map((c) => (
              <Badge key={c} color="gray">
                {c}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="heading-section">Products from this seller</h2>
          <span className="text-body-sm">
            {products.length} item{products.length !== 1 ? 's' : ''}
          </span>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No products yet"
            message="This seller hasn't listed any products."
          />
        ) : (
          <ProductGrid products={products} cols={4} />
        )}
      </section>

      <div className="text-center text-caption pt-6 border-t border-stone-200">
        All purchases made through Amazon Rebuild are backed by our A-to-z
        Guarantee. If something goes wrong, you're protected.
      </div>
    </div>
  )
}
