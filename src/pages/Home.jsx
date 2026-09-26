import { useEffect, useState } from 'react'
import HomeHero from '../components/home/HomeHero'
import ArchiveIndexRail from '../components/home/ArchiveIndexRail'
import FeaturedCollections from '../components/home/FeaturedCollections'
import EditorsPicks from '../components/home/EditorsPicks'
import TrendingNow from '../components/home/TrendingNow'
import BrandStory from '../components/home/BrandStory'
import TrustSection from '../components/home/TrustSection'
import BrandPromise from '../components/home/BrandPromise'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'
import { getAllCategories } from '../services/categoryService'
import { getFeaturedProducts, getDeals } from '../services/productService'
import { getRecentlyViewedIds } from '../hooks/useRecentlyViewed'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [editorsPicks, setEditorsPicks] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Read once on mount so we only render the "Recently viewed" section's
  // padding/border chrome when it will actually have content.
  const [hasRecentlyViewed] = useState(() => getRecentlyViewedIds().length > 0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [cats, picks, deals] = await Promise.all([
          getAllCategories(),
          getFeaturedProducts(6),
          getDeals(8),
        ])
        if (cancelled) return
        setCategories(cats || [])
        setEditorsPicks(picks || [])
        setTrending(deals || [])
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
    <div>
      <ArchiveIndexRail />
      <HomeHero categoryCount={!loading && !error ? categories.length : null} />
      <FeaturedCollections
        id="section-collections"
        categories={categories}
        loading={loading}
        error={error}
      />
      <EditorsPicks id="section-edit" products={editorsPicks} loading={loading} error={error} />
      <TrendingNow id="section-trending" products={trending} loading={loading} error={error} />
      <BrandStory id="section-story" />
      <TrustSection id="section-ledger" />
      {hasRecentlyViewed && (
        <section className="py-16 md:py-24 border-t border-stone-200">
          <RecentlyViewedStrip />
        </section>
      )}
      <BrandPromise />
    </div>
  )
}
