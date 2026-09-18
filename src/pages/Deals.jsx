import { useEffect, useState } from 'react'
import { getDeals } from '../services/productService'
import ProductGrid from '../components/ProductGrid'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDeals(24)
      .then(setDeals)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="bg-gradient-to-r from-[#cc0c39] to-[#b12704] text-white rounded-lg p-6 md:p-10 mb-6">
        <h1 className="text-3xl font-bold mb-2">Today's Deals</h1>
        <p className="text-red-100">Save big on limited-time offers across every category.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['All Deals', 'Lightning Deals', 'Best Deals', 'Prime Deals'].map((f, i) => (
          <button
            key={f}
            className={
              'text-sm px-4 py-1.5 rounded-full border transition ' +
              (i === 0
                ? 'bg-[#232f3e] text-white border-[#232f3e]'
                : 'bg-white border-gray-300 hover:border-gray-500')
            }
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton count={8} />
      ) : deals.length === 0 ? (
        <EmptyState title="No deals right now" />
      ) : (
        <ProductGrid products={deals} cols={4} />
      )}
    </div>
  )
}
