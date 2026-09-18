import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Store, Package, ArrowLeft } from 'lucide-react'
import { supabase } from '../services/supabase'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'

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
    return <div className="py-20 text-center text-sm text-gray-600">Loading…</div>
  }

  if (!seller) {
    return (
      <EmptyState
        title="Seller not found"
        message="This seller profile doesn't exist or was removed."
      />
    )
  }

  const displayName =
    seller.store_name || seller.business_name || 'Amazon Rebuild Seller'

  return (
    <div className="space-y-8">
      <Link
        to="/products"
        className="text-sm text-[#007185] hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      {/* Seller header */}
      <div className="bg-gradient-to-br from-[#232f3e] to-[#131921] text-white rounded-lg p-6 md:p-10">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-lg bg-[#febd69] text-gray-900 flex items-center justify-center">
            <Store className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-[#febd69] mb-1">
              {seller.plan === 'professional' ? 'Professional Seller' : 'Seller'}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold truncate">{displayName}</h1>
            {seller.business_location && (
              <p className="text-gray-300 text-sm mt-1">
                Ships from {seller.business_location}
              </p>
            )}
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{products.length}</div>
            <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider">
              Product{products.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {seller.product_categories && seller.product_categories.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {seller.product_categories.map((c) => (
              <span
                key={c}
                className="text-xs bg-white/10 border border-white/20 px-3 py-1 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Products from this seller
          </h2>
          <span className="text-sm text-gray-500">
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

      <div className="text-center text-xs text-gray-500 pt-6 border-t">
        All purchases made through Amazon Rebuild are backed by our A-to-z
        Guarantee. If something goes wrong, you're protected.
      </div>
    </div>
  )
}