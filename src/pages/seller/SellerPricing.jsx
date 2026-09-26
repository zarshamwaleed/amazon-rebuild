import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RefreshCw,
  Search,
  Edit3,
  Save,
  X,
  Zap,
  Package,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerPricing,
  updateProductPricing,
  deactivatePricingRule,
} from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

const cellInputBase =
  'text-right border border-stone-300 rounded-lg px-2 py-1 text-sm bg-bone-50 text-charcoal-900 focus:outline-none focus:border-brass-400 transition-avenzo'
const cellInput = 'w-24 ' + cellInputBase
const cellInputSm = 'w-20 ' + cellInputBase

export default function SellerPricing() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSellerPricing(user.id)
      setRows(data)
    } catch {
      pushToast('Could not load pricing', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      (r.title || '').toLowerCase().includes(q) ||
      (r.sku || '').toLowerCase().includes(q)
    )
  })

  function startEdit(p) {
    setEditing({
      id: p.id,
      price: p.price ?? '',
      min_price: p.min_price ?? '',
      max_price: p.max_price ?? '',
    })
  }

  function cancelEdit() {
    setEditing(null)
  }

  async function saveEdit() {
    if (!editing) return
    const { price, min_price, max_price } = editing
    if (min_price && max_price && Number(min_price) > Number(max_price)) {
      return pushToast('Minimum price cannot exceed maximum', { type: 'error' })
    }
    try {
      await updateProductPricing(user.id, editing.id, {
        price,
        min_price,
        max_price,
      })
      pushToast('Pricing updated', { type: 'success' })
      setEditing(null)
      load()
    } catch {
      pushToast('Could not save', { type: 'error' })
    }
  }

  async function toggleFeatured(p) {
    try {
      await updateProductPricing(user.id, p.id, { featured_offer: !p.featured_offer })
      load()
    } catch {
      pushToast('Could not update featured flag', { type: 'error' })
    }
  }

  async function removeRule(ruleId) {
    if (!confirm('Deactivate this automation rule?')) return
    try {
      await deactivatePricingRule(user.id, ruleId)
      pushToast('Rule deactivated', { type: 'info' })
      load()
    } catch {
      pushToast('Could not deactivate rule', { type: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Manage Pricing"
        description="Set prices, minimum and maximum bounds, and featured offer status."
        actions={
          <>
            <Link to="/seller/pricing/automate">
              <Button variant="secondary" size="md">
                <Zap className="w-4 h-4" /> Automate Pricing
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={load} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        }
      />

      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pricing by product or SKU…"
          className="flex-1 text-sm bg-transparent text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
        />
      </div>

      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products to price"
            message="Add products first to manage pricing."
            action={
              <Link to="/seller/products/new">
                <Button variant="secondary">Add a product</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-label text-left px-5 py-3">Product</th>
                  <th className="text-label text-left px-4 py-3">SKU</th>
                  <th className="text-label text-right px-4 py-3">Current</th>
                  <th className="text-label text-right px-4 py-3">Min</th>
                  <th className="text-label text-right px-4 py-3">Max</th>
                  <th className="text-label text-center px-4 py-3">Featured</th>
                  <th className="text-label text-left px-4 py-3">Automation</th>
                  <th className="text-label text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((p) => {
                  const isEditing = editing?.id === p.id
                  const rule = p.rule && p.rule.status === 'active' ? p.rule : null
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition-avenzo">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                              <Package className="w-4 h-4 text-charcoal-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-charcoal-900 truncate max-w-xs">
                              {p.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-charcoal-500">
                        {p.sku || '—'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editing.price}
                            onChange={(e) =>
                              setEditing((s) => ({ ...s, price: e.target.value }))
                            }
                            className={cellInput}
                          />
                        ) : (
                          <span className="font-medium text-charcoal-900">
                            ${Number(p.price || 0).toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editing.min_price}
                            onChange={(e) =>
                              setEditing((s) => ({ ...s, min_price: e.target.value }))
                            }
                            placeholder="—"
                            className={cellInputSm}
                          />
                        ) : (
                          <span className="text-charcoal-700">
                            {p.min_price ? '$' + Number(p.min_price).toFixed(2) : '—'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editing.max_price}
                            onChange={(e) =>
                              setEditing((s) => ({ ...s, max_price: e.target.value }))
                            }
                            placeholder="—"
                            className={cellInputSm}
                          />
                        ) : (
                          <span className="text-charcoal-700">
                            {p.max_price ? '$' + Number(p.max_price).toFixed(2) : '—'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={!!p.featured_offer}
                          onChange={() => toggleFeatured(p)}
                          className="cursor-pointer accent-brass-500 w-4 h-4"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        {rule ? (
                          <div className="flex items-center gap-2">
                            <Badge color="green">
                              <Zap className="w-3 h-3" /> Active
                            </Badge>
                            <button
                              onClick={() => removeRule(rule.id)}
                              className="text-xs font-medium text-error-700 hover:text-error-500 transition-avenzo"
                            >
                              Deactivate
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-charcoal-400">None</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 hover:bg-success-50 rounded-lg transition-avenzo"
                              title="Save"
                            >
                              <Save className="w-4 h-4 text-success-700" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                              title="Cancel"
                            >
                              <X className="w-4 h-4 text-charcoal-500" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(p)}
                            className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                            title="Edit pricing"
                          >
                            <Edit3 className="w-4 h-4 text-charcoal-500" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-info-50 border border-info-500/25 rounded-xl p-4 text-body-sm text-info-700">
        <strong className="text-charcoal-900">Note on bounds:</strong> Min and max define the range automated pricing
        is allowed to adjust within. Amazon will never sell below min or above max.
      </div>
    </div>
  )
}
