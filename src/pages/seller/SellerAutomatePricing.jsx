import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, TrendingDown, TrendingUp, Info } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerPricing, upsertPricingRule } from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

// Deterministic simulated "competitor price" per product — stable across renders.
function simulateCompetitorPrice(product) {
  const base = Number(product.price) || 49.99
  const seed = (product.id || '').charCodeAt(0) % 10
  const pct = ((seed - 5) / 100) // -5% to +4%
  return +(base * (1 + pct)).toFixed(2)
}

export default function SellerAutomatePricing() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  const [undercutBy, setUndercutBy] = useState('1.00')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSellerPricing(user.id)
      setProducts(data)
      if (data.length > 0) setSelectedId(data[0].id)
    } catch {
      pushToast('Could not load products', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) || null,
    [products, selectedId]
  )

  // Prefill the form when product changes
  useEffect(() => {
    if (!selected) return
    setUndercutBy(
      selected.rule?.undercut_by != null ? String(selected.rule.undercut_by) : '1.00'
    )
    setMinPrice(
      selected.rule?.min_price != null
        ? String(selected.rule.min_price)
        : selected.min_price != null
        ? String(selected.min_price)
        : ''
    )
    setMaxPrice(
      selected.rule?.max_price != null
        ? String(selected.rule.max_price)
        : selected.max_price != null
        ? String(selected.max_price)
        : ''
    )
  }, [selected])

  const competitor = selected ? simulateCompetitorPrice(selected) : 0
  const suggestedPrice =
    selected && competitor
      ? Math.max(
          Number(minPrice || selected.min_price || 0),
          Math.min(
            competitor - Number(undercutBy || 0),
            Number(maxPrice || selected.max_price || 999999)
          )
        )
      : 0

  async function handleActivate() {
    if (!selected) return
    if (!minPrice || !maxPrice) {
      return pushToast('Set a minimum and maximum price first', { type: 'error' })
    }
    if (Number(minPrice) >= Number(maxPrice)) {
      return pushToast('Minimum must be less than maximum', { type: 'error' })
    }

    setSaving(true)
    try {
      await upsertPricingRule(user.id, {
        product_id: selected.id,
        rule_type: 'undercut',
        undercut_by: Number(undercutBy) || 1,
        min_price: Number(minPrice),
        max_price: Number(maxPrice),
        status: 'active',
      })
      pushToast('Automation rule activated', { type: 'success' })
      await load()
    } catch (err) {
      pushToast(err.message || 'Could not activate rule', { type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-16 rounded-xl skeleton-shimmer" />
        <div className="grid lg:grid-cols-[320px_1fr] gap-5">
          <div className="h-96 rounded-xl skeleton-shimmer" />
          <div className="h-96 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-10">
      <SellerPageHeader
        backTo="/seller/pricing"
        title="Automate Pricing"
        description="Set a rule so your price automatically adjusts within bounds."
      />

      {products.length === 0 ? (
        <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
          <EmptyState
            icon={Zap}
            title="No products to automate"
            message="Add products first, then create automation rules here."
          />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-5">
          {/* Product list */}
          <aside className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden self-start">
            <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 text-label">
              Select a product
            </div>
            <ul className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
              {products.map((p) => {
                const active = selectedId === p.id
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className={
                        'w-full text-left px-4 py-3 transition-avenzo ' +
                        (active ? 'bg-brass-50' : 'hover:bg-stone-50')
                      }
                    >
                      <div className="text-sm font-medium text-charcoal-900 truncate">
                        {p.title}
                      </div>
                      <div className="text-xs text-charcoal-500 mt-0.5 flex items-center gap-2">
                        <span>${Number(p.price || 0).toFixed(2)}</span>
                        {p.rule?.status === 'active' && (
                          <Badge color="green" variant="chip">
                            <Zap className="w-3 h-3" /> Rule active
                          </Badge>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Rule builder */}
          {selected && (
            <section className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-6 space-y-6">
              <div>
                <h2 className="heading-sub">{selected.title}</h2>
                <p className="text-caption font-mono mt-0.5">SKU: {selected.sku || '—'}</p>
              </div>

              {/* Current state */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                  <div className="text-label mb-1">Your current price</div>
                  <div className="font-display text-2xl text-charcoal-900">
                    ${Number(selected.price || 0).toFixed(2)}
                  </div>
                </div>
                <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                  <div className="text-label mb-1">Simulated competitor</div>
                  <div className="font-display text-2xl text-charcoal-900">
                    ${competitor.toFixed(2)}
                  </div>
                  <div className="text-xs mt-1">
                    {competitor < Number(selected.price) ? (
                      <span className="text-error-700 inline-flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Competitor is lower
                      </span>
                    ) : (
                      <span className="text-success-700 inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> You are lower
                      </span>
                    )}
                  </div>
                </div>
                <div className="border border-brass-300 rounded-lg p-4 bg-brass-50">
                  <div className="text-label text-brass-700 mb-1">Suggested price</div>
                  <div className="font-display text-2xl text-brass-700">
                    ${suggestedPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Rule form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-label mb-1.5">Pricing rule</label>
                  <div className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 flex items-center gap-2 text-charcoal-800">
                    <Zap className="w-4 h-4 text-brass-600 flex-shrink-0" />
                    Stay <strong className="text-charcoal-900">${Number(undercutBy || 0).toFixed(2)}</strong> below the
                    lowest competing offer
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <Input
                    label="Undercut by (USD)"
                    type="number"
                    step="0.01"
                    value={undercutBy}
                    onChange={(e) => setUndercutBy(e.target.value)}
                  />
                  <Input
                    label="Minimum price (USD)"
                    type="number"
                    step="0.01"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="35.00"
                  />
                  <Input
                    label="Maximum price (USD)"
                    type="number"
                    step="0.01"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="50.00"
                  />
                </div>

                <div className="flex items-start gap-2 text-xs text-charcoal-600 bg-stone-50 border border-stone-200 rounded-lg p-3">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-charcoal-400" />
                  <div>
                    Your price will never fall below the minimum or rise above the
                    maximum. This is a simulated rule — pricing is not actually adjusted
                    in this demo.
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <Link to="/seller/pricing">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button variant="secondary" onClick={handleActivate} loading={saving}>
                  <Zap className="w-4 h-4" />
                  {selected.rule?.status === 'active' ? 'Update rule' : 'Activate rule'}
                </Button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
