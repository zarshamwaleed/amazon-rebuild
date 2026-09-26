import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Store } from 'lucide-react'
import { getPublicStore } from '../services/sellerService'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'
import Card from '../components/Card'
import LoadingSkeleton from '../components/LoadingSkeleton'

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
    return (
      <div className="space-y-10">
        <div className="skeleton-shimmer rounded-2xl aspect-[16/6] min-h-[220px]" />
        <LoadingSkeleton count={8} cols={4} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-10">
        <EmptyState
          title="Store not found"
          message="This store is not published or does not exist."
        />
        <div className="text-center mt-6">
          <Link to="/" className="text-body-sm text-brass-700 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const { store, featured, grid } = data
  const hasImage = Boolean(store.hero_image_url)

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section
        className={
          hasImage
            ? 'relative rounded-2xl overflow-hidden border border-stone-200 animate-fade-in-up'
            : 'bg-bone-50 border border-stone-200 rounded-2xl shadow-subtle animate-fade-in-up'
        }
      >
        {hasImage ? (
          <div className="relative aspect-[16/6] min-h-[220px]">
            <img
              src={store.hero_image_url}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/30 to-transparent" />
            <div className="relative h-full flex items-end p-6 md:p-10">
              <div>
                {store.logo_url && (
                  <img
                    src={store.logo_url}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border-2 border-bone-50 bg-bone-50 mb-3 shadow-soft"
                  />
                )}
                <h1 className="font-display text-display-sm text-bone-50 drop-shadow-md">
                  {store.store_name}
                </h1>
                {store.tagline && (
                  <p className="text-body-lg text-bone-100/90 mt-2 drop-shadow">
                    {store.tagline}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-10 flex items-center gap-5 flex-wrap">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt=""
                className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-charcoal-900 text-brass-400 flex items-center justify-center shrink-0">
                <Store className="w-8 h-8" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-heading-page md:text-display-sm text-charcoal-900 truncate">
                {store.store_name}
              </h1>
              {store.tagline && (
                <p className="text-body-lg mt-1.5">{store.tagline}</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Brand description */}
      {store.brand_description && (
        <section className="max-w-3xl">
          <p className="text-body leading-relaxed">{store.brand_description}</p>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="heading-section">Featured products</h2>
          </div>
          <ProductGrid products={featured} cols={4} />
        </section>
      )}

      {/* Product grid */}
      {grid.length > 0 && (
        <section>
          <h2 className="heading-section mb-4">All products</h2>
          <ProductGrid products={grid} cols={4} />
        </section>
      )}

      {/* Brand story */}
      {store.brand_story && (
        <Card title="Our story">
          <p className="text-body leading-relaxed whitespace-pre-line">
            {store.brand_story}
          </p>
        </Card>
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
