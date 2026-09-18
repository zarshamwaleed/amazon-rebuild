import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { getRecentlyViewedIds } from '../hooks/useRecentlyViewed'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Browsing History</h1>

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No browsing history yet"
          message="Products you view will show up here."
        />
      ) : (
        <>
          <ProductGrid products={products} cols={4} />
          <div className="mt-6 text-center">
            <button
              onClick={clear}
              className="text-sm text-blue-600 hover:text-[#c7511f] hover:underline"
            >
              Clear browsing history
            </button>
          </div>
        </>
      )}
    </div>
  )
}
