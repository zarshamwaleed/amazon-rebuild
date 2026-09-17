import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { getRecentlyViewedIds } from '../hooks/useRecentlyViewed'
import ProductGrid from './ProductGrid'

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
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recently viewed</h2>
      <ProductGrid products={products} cols={4} />
    </section>
  )
}
