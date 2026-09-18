import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingDown } from 'lucide-react'
import { supabase } from '../services/supabase'
import { getDeals } from '../services/productService'
import ProductGrid from '../components/ProductGrid'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

function useCountdown(targetDate) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const target = new Date(targetDate).getTime()
  const diff = Math.max(0, target - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s, expired: diff === 0 }
}

function LiveDealCard({ deal }) {
  const { d, h, m, s, expired } = useCountdown(deal.end_date)
  const product = deal.products
  const discountPct =
    deal.original_price > 0
      ? Math.round((1 - deal.deal_price / deal.original_price) * 100)
      : 0
  const progress =
    deal.quantity_limit > 0
      ? Math.min(100, (deal.quantity_sold / deal.quantity_limit) * 100)
      : 0

  if (!product) return null

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        )}
        <span className="absolute top-2 left-2 bg-[#cc0c39] text-white text-xs font-bold px-2 py-1 rounded">
          -{discountPct}%
        </span>
        <span className="absolute top-2 right-2 bg-[#232f3e] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <TrendingDown className="w-3 h-3" /> DEAL
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-[#b12704]">
            ${Number(deal.deal_price).toFixed(2)}
          </span>
          <span className="text-xs text-gray-500 line-through">
            ${Number(deal.original_price).toFixed(2)}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>
              {deal.quantity_sold} / {deal.quantity_limit} claimed
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#febd69] to-[#f3a847]"
              style={{ width: progress + '%' }}
            />
          </div>
        </div>

        <div className="mt-auto bg-[#232f3e] text-white text-xs rounded px-3 py-2 flex items-center justify-between">
          <span className="uppercase tracking-wider">Ends in</span>
          <span className="font-mono font-bold">
            {expired
              ? 'Ended'
              : `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [liveDeals, setLiveDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [discounted, live] = await Promise.all([
          getDeals(24).catch(() => []),
          supabase
            .from('deals')
            .select('*, products(*)')
            .eq('status', 'active')
            .lte('start_date', new Date().toISOString())
            .gte('end_date', new Date().toISOString())
            .then(({ data }) => data || []),
        ])
        if (cancelled) return
        setDeals(discounted)
        setLiveDeals(live)
      } catch {
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
      <div className="bg-gradient-to-r from-[#cc0c39] to-[#b12704] text-white rounded-lg p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Today's Deals</h1>
        <p className="text-red-100">Save big on limited-time offers across every category.</p>
      </div>

      <div className="flex flex-wrap gap-2">
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
      ) : (
        <>
          {/* Live seller deals with countdown */}
          {liveDeals.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Live deals</h2>
                <span className="text-sm text-gray-500">Ending soon — claim them fast</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {liveDeals.map((d) => (
                  <LiveDealCard key={d.id} deal={d} />
                ))}
              </div>
            </section>
          )}

          {/* Existing discounted products */}
          {deals.length > 0 ? (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">All deals</h2>
              <ProductGrid products={deals} cols={4} />
            </section>
          ) : (
            liveDeals.length === 0 && (
              <EmptyState
                title="No deals right now"
                message="Check back soon for new deals."
              />
            )
          )}
        </>
      )}
    </div>
  )
}