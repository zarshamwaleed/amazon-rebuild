import { useEffect, useState } from 'react'
import HeroBanner from '../components/HeroBanner'
import SectionHeader from '../components/SectionHeader'
import CategoryCard from '../components/CategoryCard'
import ProductGrid from '../components/ProductGrid'
import PromoStrip from '../components/PromoStrip'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'
import { getAllCategories } from '../services/categoryService'
import { getFeaturedProducts, getDeals } from '../services/productService'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [cats, feat, dl] = await Promise.all([
          getAllCategories(),
          getFeaturedProducts(8),
          getDeals(4),
        ])
        if (cancelled) return
        setCategories(cats)
        setFeatured(feat)
        setDeals(dl)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-8">
      <HeroBanner />

      <section>
        <SectionHeader title="Shop by Category" seeMoreTo="/products" />
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        )}
      </section>

      <PromoStrip
        title="Today's Deals — up to 40% off"
        subtitle="Limited-time savings across every category."
        cta="See deals"
        to="/products"
      />

      <section>
        <SectionHeader title="Deals of the Day" seeMoreTo="/products" />
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : deals.length === 0 ? (
          <EmptyState title="No deals right now" message="Check back soon." />
        ) : (
          <ProductGrid products={deals} cols={4} />
        )}
      </section>

      <section>
        <SectionHeader title="Recommended for You" seeMoreTo="/products" />
        {loading ? (
          <LoadingSkeleton count={8} />
        ) : error ? (
          <EmptyState title="Could not load products" message={error} />
        ) : featured.length === 0 ? (
          <EmptyState title="No products yet" />
        ) : (
          <ProductGrid products={featured} cols={4} />
        )}
      </section>

      <PromoStrip
        title="Free delivery on orders over $50"
        subtitle="Fast, reliable shipping to your door."
        cta="Start shopping"
        to="/products"
      />

      <section>
        <SectionHeader title="Top Rated" seeMoreTo="/products" />
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <ProductGrid products={featured.slice(0, 4)} cols={4} />
        )}
      </section>

      <RecentlyViewedStrip />
    </div>
  )
}
