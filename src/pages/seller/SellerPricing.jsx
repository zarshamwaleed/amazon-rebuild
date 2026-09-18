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
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerPricing,
  updateProductPricing,
  deactivatePricingRule,
} from '../../services/sellerService'

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
    } catch (err) {
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
    } catch (err) {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Pricing</h1>
          <p className="text-sm text-gray-600">
            Set prices, minimum and maximum bounds, and featured offer status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/seller/pricing/automate"
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 transition text-sm"
          >
            <Zap className="w-4 h-4" /> Automate Pricing
          </Link>
          <button
            onClick={load}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pricing by product or SKU..."
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-600">Loading pricing…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No products to price</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add products first to manage pricing.
            </p>
            <Link
              to="/seller/products/new"
              className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded"
            >
              Add a product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-left px-4 py-3">SKU</th>
                  <th className="text-right px-4 py-3">Current</th>
                  <th className="text-right px-4 py-3">Min</th>
                  <th className="text-right px-4 py-3">Max</th>
                  <th className="text-center px-4 py-3">Featured</th>
                  <th className="text-left px-4 py-3">Automation</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isEditing = editing?.id === p.id
                  const rule = p.rule && p.rule.status === 'active' ? p.rule : null
                  return (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt=""
                              className="w-10 h-10 rounded object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-xs">
                              {p.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {p.sku || '—'}
                      </td>

                      {/* Current price */}
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editing.price}
                            onChange={(e) =>
                              setEditing((s) => ({ ...s, price: e.target.value }))
                            }
                            className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">
                            ${Number(p.price || 0).toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Min */}
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editing.min_price}
                            onChange={(e) =>
                              setEditing((s) => ({ ...s, min_price: e.target.value }))
                            }
                            placeholder="—"
                            className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="text-gray-700">
                            {p.min_price ? '$' + Number(p.min_price).toFixed(2) : '—'}
                          </span>
                        )}
                      </td>

                      {/* Max */}
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editing.max_price}
                            onChange={(e) =>
                              setEditing((s) => ({ ...s, max_price: e.target.value }))
                            }
                            placeholder="—"
                            className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="text-gray-700">
                            {p.max_price ? '$' + Number(p.max_price).toFixed(2) : '—'}
                          </span>
                        )}
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!p.featured_offer}
                          onChange={() => toggleFeatured(p)}
                          className="cursor-pointer"
                        />
                      </td>

                      {/* Automation */}
                      <td className="px-4 py-3">
                        {rule ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                              <Zap className="w-3 h-3" /> Active
                            </span>
                            <button
                              onClick={() => removeRule(rule.id)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Deactivate
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 hover:bg-green-50 rounded"
                              title="Save"
                            >
                              <Save className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 hover:bg-gray-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(p)}
                            className="p-1.5 hover:bg-gray-100 rounded"
                            title="Edit pricing"
                          >
                            <Edit3 className="w-4 h-4 text-gray-600" />
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <strong>Note on bounds:</strong> Min and max define the range automated pricing
        is allowed to adjust within. Amazon will never sell below min or above max.
      </div>
    </div>
  )
}