import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { getRecentlyViewedIds } from '../hooks/useRecentlyViewed'
import ProductCard from './ProductCard'
import SectionHeader from './SectionHeader'
import Reveal from './home/Reveal'

export default function RecentlyViewedStrip({ excludeId }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      let ids = getRecentlyViewedIds()
      if (excludeId) ids = ids.filter((id) => id !== excludeId)
      if (!ids.length) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids.slice(0, 8))
      if (error) {
        console.warn('[recently-viewed]', error.message)
        return
      }
      if (cancelled) return

      // Preserve order of most recently viewed
      const map = new Map((data || []).map((p) => [p.id, p]))
      const ordered = ids.map((id) => map.get(id)).filter(Boolean)
      setProducts(ordered)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [excludeId])

  if (!products.length) return null

  return (
    <section>
      <SectionHeader title="Recently viewed" />
      <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
        {products.map((p, i) => (
          <Reveal key={p.id} as="div" variant="up" delay={Math.min(i, 6) * 40} className="w-44 shrink-0 snap-start sm:w-56">
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
