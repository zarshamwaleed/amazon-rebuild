import { useEffect, useState } from 'react'
import Slideshow from '../components/Slideshow'
import CategoryCardGrid from '../components/CategoryCardGrid'
import SectionHeader from '../components/SectionHeader'
import CategoryCard from '../components/CategoryCard'
import ProductGrid from '../components/ProductGrid'
import PromoStrip from '../components/PromoStrip'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'
import { getAllCategories } from '../services/categoryService'
import { getFeaturedProducts, getDeals } from '../services/productService'

const FEATURED_CARDS = [
  {
    id: 'gaming',
    title: 'Get your game on',
    primary: {
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      label: 'Shop gaming',
      to: '/search?q=keyboard',
    },
    tiles: [
      {
        label: 'Headsets',
        image:
          'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=headphones',
      },
      {
        label: 'Keyboards',
        image:
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=keyboard',
      },
      {
        label: 'Mice',
        image:
          'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=mouse',
      },
    ],
    link: { label: 'See all gaming', to: '/category/electronics' },
  },
  {
    id: 'kitchen',
    title: 'Top categories in Kitchen appliances',
    primary: {
      image:
        'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80',
      label: 'Cooker',
      to: '/search?q=cookware',
    },
    tiles: [
      {
        label: 'Coffee',
        image:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=coffee',
      },
      {
        label: 'Pots and Pans',
        image:
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=cookware',
      },
      {
        label: 'Kettles',
        image:
          'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=kettle',
      },
    ],
    link: { label: 'Explore all products in Kitchen', to: '/category/home-kitchen' },
  },
  {
    id: 'fashion',
    title: 'Shop Fashion for less',
    tiles: [
      {
        label: 'Jeans under $50',
        image:
          'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=denim',
      },
      {
        label: 'Tops under $25',
        image:
          'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=jacket',
      },
      {
        label: 'Dresses under $30',
        image:
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
        to: '/category/fashion',
      },
      {
        label: 'Shoes under $50',
        image:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=shoes',
      },
    ],
    link: { label: 'See all deals', to: '/category/fashion' },
  },
  {
    id: 'home',
    title: 'Easy updates for elevated spaces',
    tiles: [
      {
        label: 'Baskets & hampers',
        image:
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80',
        to: '/search?q=pillow',
      },
      {
        label: 'Hardware',
        image:
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80',
        to: '/category/home-kitchen',
      },
      {
        label: 'Accent furniture',
        image:
          'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=400&q=80',
        to: '/category/home-kitchen',
      },
      {
        label: 'Wallpaper & paint',
        image:
          'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=400&q=80',
        to: '/category/home-kitchen',
      },
    ],
    link: { label: 'Shop home products', to: '/category/home-kitchen' },
  },
]

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
      <Slideshow />
      <CategoryCardGrid cards={FEATURED_CARDS} />

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


