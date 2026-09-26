import { useEffect, useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { supabase } from '../services/supabase'
import { getRecentlyViewedIds } from '../hooks/useRecentlyViewed'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import Button from '../components/Button'

export default function BrowsingHistory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const ids = getRecentlyViewedIds()
      if (!ids.length) {
        setLoading(false)
        return
      }
      const { data } = await supabase.from('products').select('*').in('id', ids)
      const map = new Map((data || []).map((p) => [p.id, p]))
      const ordered = ids.map((id) => map.get(id)).filter(Boolean)
      setProducts(ordered)
      setLoading(false)
    }
    load()
  }, [])

  function clear() {
    localStorage.removeItem('amazon-rebuild-recently-viewed-v1')
    setProducts([])
  }

  return (
    <div>
      <div className="mb-6 md:mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-label mb-1.5 flex items-center gap-1.5 text-brass-600">
            <History className="w-3.5 h-3.5" /> Your activity
          </p>
          <h1 className="heading-page">Browsing History</h1>
        </div>
        {!loading && products.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 className="w-3.5 h-3.5" />
            Clear history
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton cols={4} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={History}
          title="No browsing history yet"
          message="Products you view will show up here."
        />
      ) : (
        <ProductGrid products={products} cols={4} />
      )}
    </div>
  )
}
