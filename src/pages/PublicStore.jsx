import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicStore } from '../services/sellerService'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'

export default function PublicStore() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    getPublicStore(slug)
      .then((r) => {
        if (!cancelled) setData(r)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-600">Loading store…</div>
  }

  if (!data) {
    return (
      <div className="py-10">
        <EmptyState
          title="Store not found"
          message="This store is not published or does not exist."
        />
        <div className="text-center mt-6">
          <Link to="/" className="text-[#007185] hover:underline text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const { store, featured, grid } = data

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative rounded-lg overflow-hidden bg-gradient-to-br from-[#232f3e] to-[#131921]">
        <div className="relative aspect-[16/6] min-h-[220px]">
          {store.hero_image_url && (
            <img
              src={store.hero_image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="relative h-full flex items-end p-6 md:p-10">
            <div>
              {store.logo_url && (
                <img
                  src={store.logo_url}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover border-2 border-white bg-white mb-3"
                />
              )}
              <h1 className="text-white text-3xl md:text-5xl font-bold drop-shadow-md">
                {store.store_name}
              </h1>
              {store.tagline && (
                <p className="text-gray-100 text-sm md:text-lg mt-2 drop-shadow">
                  {store.tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Brand description */}
      {store.brand_description && (
        <section className="max-w-3xl">
          <p className="text-gray-700 leading-relaxed">{store.brand_description}</p>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Featured products</h2>
          </div>
          <ProductGrid products={featured} cols={4} />
        </section>
      )}

      {/* Product grid */}
      {grid.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">All products</h2>
          <ProductGrid products={grid} cols={4} />
        </section>
      )}

      {/* Brand story */}
      {store.brand_story && (
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Our story</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {store.brand_story}
          </p>
        </section>
      )}

      {featured.length === 0 && grid.length === 0 && (
        <EmptyState
          title="No products in this store yet"
          message="Check back soon."
        />
      )}
    </div>
  )
}