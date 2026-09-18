import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Zap,
  TrendingDown,
  TrendingUp,
  Info,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerPricing,
  upsertPricingRule,
} from '../../services/sellerService'

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
    return <div className="text-sm text-gray-600">Loading…</div>
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/seller/pricing"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Automate Pricing</h1>
          <p className="text-sm text-gray-600">
            Set a rule so your price automatically adjusts within bounds.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">No products to automate</h3>
          <p className="text-sm text-gray-600">
            Add products first, then create automation rules here.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-5">
          {/* Product list */}
          <aside className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              Select a product
            </div>
            <ul className="divide-y max-h-[600px] overflow-y-auto">
              {products.map((p) => {
                const active = selectedId === p.id
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className={
                        'w-full text-left px-4 py-3 transition ' +
                        (active ? 'bg-orange-50' : 'hover:bg-gray-50')
                      }
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {p.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>${Number(p.price || 0).toFixed(2)}</span>
                        {p.rule?.status === 'active' && (
                          <span className="text-green-700 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Rule active
                          </span>
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
            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.title}</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  SKU: {selected.sku || '—'}
                </p>
              </div>

              {/* Current state */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Your current price
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${Number(selected.price || 0).toFixed(2)}
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Simulated competitor
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${competitor.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {competitor < Number(selected.price) ? (
                      <span className="text-red-600 inline-flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Competitor is lower
                      </span>
                    ) : (
                      <span className="text-green-700 inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> You are lower
                      </span>
                    )}
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                  <div className="text-xs uppercase tracking-wider text-[#c7511f] mb-1">
                    Suggested price
                  </div>
                  <div className="text-2xl font-bold text-[#c7511f]">
                    ${suggestedPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Rule form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Pricing rule
                  </label>
                  <div className="border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#c7511f]" />
                    Stay <strong>${Number(undercutBy || 0).toFixed(2)}</strong> below the
                    lowest competing offer
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Undercut by
                    </label>
                    <div className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1.5 bg-white">
                      <span className="text-sm text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={undercutBy}
                        onChange={(e) => setUndercutBy(e.target.value)}
                        className="flex-1 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Minimum price
                    </label>
                    <div className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1.5 bg-white">
                      <span className="text-sm text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="35.00"
                        className="flex-1 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Maximum price
                    </label>
                    <div className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1.5 bg-white">
                      <span className="text-sm text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="50.00"
                        className="flex-1 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-3">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    Your price will never fall below the minimum or rise above the
                    maximum. This is a simulated rule — pricing is not actually adjusted
                    in this demo.
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link
                  to="/seller/pricing"
                  className="px-5 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleActivate}
                  disabled={saving}
                  className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded flex items-center gap-2 disabled:opacity-60 transition"
                >
                  <Zap className="w-4 h-4" />
                  {saving ? 'Activating…' : selected.rule?.status === 'active' ? 'Update rule' : 'Activate rule'}
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}