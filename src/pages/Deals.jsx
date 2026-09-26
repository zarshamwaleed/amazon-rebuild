import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { supabase } from '../services/supabase'
import { getDeals } from '../services/productService'
import ProductGrid from '../components/ProductGrid'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import PromoStrip from '../components/PromoStrip'

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
      className="group relative flex flex-col bg-bone-50 border border-stone-200 rounded-xl overflow-hidden transition-avenzo hover:border-stone-300 hover:shadow-card hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-avenzo duration-slower ease-avenzo-out group-hover:scale-[1.07]"
          />
        )}
        {discountPct > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-charcoal-900/90 text-bone-50 text-av-caption font-semibold tracking-wide px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
      </div>

      <div className="p-3.5 flex flex-col flex-1 gap-1.5">
        <h3 className="text-av-body-sm font-medium text-charcoal-800 line-clamp-2 leading-snug transition-avenzo group-hover:text-brass-700">
          {product.title}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-price">${Number(deal.deal_price).toFixed(2)}</span>
          <span className="text-caption line-through">${Number(deal.original_price).toFixed(2)}</span>
        </div>

        {deal.quantity_limit > 0 && (
          <div className="pt-0.5">
            <div className="flex justify-between text-caption mb-1">
              <span>{Math.round(progress)}% claimed</span>
              <span>{deal.quantity_sold} / {deal.quantity_limit}</span>
            </div>
            <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brass-500 rounded-full transition-avenzo"
                style={{ width: progress + '%' }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between border-t border-stone-100">
          <span className="inline-flex items-center gap-1.5 text-caption">
            <Clock className="w-3.5 h-3.5 text-charcoal-400" />
            {expired ? 'Ended' : 'Ends in'}
          </span>
          {!expired && (
            <span className="font-mono text-av-body-sm font-semibold text-brass-700 tabular-nums">
              {d > 0 ? `${d}d ` : ''}{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </span>
          )}
        </div>

        <Button variant="secondary" size="sm" className="w-full mt-1" tabIndex={-1}>
          View deal
        </Button>
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
        // ignore — loading state below reflects the failure implicitly
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
      <PromoStrip
        title="Today's Deals"
        subtitle="Save on limited-time offers across every category."
      />

      <div className="flex flex-wrap gap-2">
        {['All Deals', 'Lightning Deals', 'Best Deals', 'Prime Deals'].map((f, i) => (
          <button
            key={f}
            className={
              'text-body-sm px-4 py-1.5 rounded-full border transition-avenzo ' +
              (i === 0
                ? 'bg-charcoal-900 text-bone-50 border-charcoal-900'
                : 'bg-bone-50 border-stone-300 text-charcoal-700 hover:border-stone-400')
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
                <h2 className="heading-section">Live deals</h2>
                <span className="text-body-sm">Ending soon</span>
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
              <h2 className="heading-section mb-4">All deals</h2>
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
