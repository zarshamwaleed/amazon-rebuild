import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Package,
  PackageX,
  Edit3,
  RefreshCw,
  Eye,
  Save,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerInventory, updateInventory } from '../../services/sellerService'

const TABS = [
  { id: 'all', label: 'All Inventory' },
  { id: 'fba', label: 'FBA' },
  { id: 'fbm', label: 'FBM' },
  { id: 'low', label: 'Low Stock' },
  { id: 'out', label: 'Out of Stock' },
  { id: 'inbound', label: 'Inbound' },
  { id: 'reserved', label: 'Reserved' },
]

export default function SellerInventory() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // { id, stock, price }

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSellerInventory(user.id)
      setItems(data)
    } catch (err) {
      pushToast('Could not load inventory', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const filtered = useMemo(() => {
    let list = items
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q)
      )
    }
    switch (tab) {
      case 'fba':
        return list.filter((p) => p.fulfillment_method === 'FBA')
      case 'fbm':
        return list.filter((p) => p.fulfillment_method !== 'FBA')
      case 'low':
        return list.filter(
          (p) => p.available > 0 && p.available <= (p.low_stock_threshold || 5)
        )
      case 'out':
        return list.filter((p) => p.available === 0)
      case 'inbound':
        return list.filter((p) => (p.inbound || 0) > 0)
      case 'reserved':
        return list.filter((p) => (p.reserved || 0) > 0)
      case 'all':
      default:
        return list
    }
  }, [items, tab, query])

  const counts = useMemo(() => {
    const c = { all: items.length, fba: 0, fbm: 0, low: 0, out: 0, inbound: 0, reserved: 0 }
    for (const p of items) {
      if (p.fulfillment_method === 'FBA') c.fba++
      else c.fbm++
      if (p.available === 0) c.out++
      else if (p.available <= (p.low_stock_threshold || 5)) c.low++
      if ((p.inbound || 0) > 0) c.inbound++
      if ((p.reserved || 0) > 0) c.reserved++
    }
    return c
  }, [items])

  function startEdit(p) {
    setEditing({ id: p.id, stock: p.stock, price: p.price })
  }

  function cancelEdit() {
    setEditing(null)
  }

  async function saveEdit() {
    if (!editing) return
    try {
      await updateInventory(user.id, editing.id, {
        stock: editing.stock,
        price: editing.price,
      })
      pushToast('Inventory updated', { type: 'success' })
      setEditing(null)
      load()
    } catch (err) {
      pushToast('Could not update', { type: 'error' })
    }
  }

  async function quickRestock(p) {
    const add = prompt('How many units to add to "' + p.title + '"?', '10')
    if (!add) return
    const n = Number(add)
    if (!n || n <= 0) return pushToast('Enter a valid number', { type: 'error' })
    try {
      await updateInventory(user.id, p.id, { stock: (p.stock || 0) + n })
      pushToast('Restocked +' + n, { type: 'success' })
      load()
    } catch {
      pushToast('Could not restock', { type: 'error' })
    }
  }

  function statusFor(p) {
    if (p.available === 0) return { label: 'Out of stock', cls: 'bg-red-100 text-red-800' }
    if (p.available <= (p.low_stock_threshold || 5))
      return { label: 'Low stock', cls: 'bg-amber-100 text-amber-800' }
    return { label: 'In stock', cls: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Inventory</h1>
          <p className="text-sm text-gray-600">
            {items.length} SKU{items.length !== 1 ? 's' : ''} in your catalog
          </p>
        </div>
        <button
          onClick={load}
          className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition flex items-center gap-2 ' +
              (tab === t.id
                ? 'border-[#c7511f] text-[#c7511f]'
                : 'border-transparent text-gray-600 hover:text-gray-900')
            }
          >
            {t.label}
            {counts[t.id] > 0 && (
              <span
                className={
                  'text-xs px-1.5 py-0.5 rounded-full ' +
                  (tab === t.id ? 'bg-orange-100 text-[#c7511f]' : 'bg-gray-100 text-gray-600')
                }
              >
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search inventory by product or SKU..."
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-600">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <EmptyInventory tab={tab} hasQuery={query.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-left px-4 py-3">SKU</th>
                  <th className="text-right px-4 py-3">Available</th>
                  <th className="text-right px-4 py-3">Reserved</th>
                  <th className="text-right px-4 py-3">Inbound</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-center px-4 py-3">Fulfillment</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = statusFor(p)
                  const isEditing = editing?.id === p.id
                  const low =
                    p.available > 0 && p.available <= (p.low_stock_threshold || 5)
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
                            {low && (
                              <div className="text-xs text-amber-700 flex items-center gap-1 mt-0.5">
                                ⚠ Low stock
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {p.sku || '—'}
                      </td>

                      {/* Available — editable */}
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editing.stock}
                            onChange={(e) =>
                              setEditing((s) => ({ ...s, stock: e.target.value }))
                            }
                            className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                          />
                        ) : (
                          <span className={p.available === 0 ? 'text-red-600' : 'text-gray-900'}>
                            {p.available}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-gray-600">
                        {p.reserved || 0}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {p.inbound || 0}
                      </td>

                      {/* Price — editable */}
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editing.price}
                            onChange={(e) =>
                              setEditing((s) => ({ ...s, price: e.target.value }))
                            }
                            className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                          />
                        ) : (
                          <span className="text-gray-900">
                            ${Number(p.price || 0).toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {p.fulfillment_method || 'FBM'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            'inline-block text-xs font-medium px-2 py-0.5 rounded-full ' +
                            status.cls
                          }
                        >
                          {status.label}
                        </span>
                      </td>

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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(p)}
                              className="p-1.5 hover:bg-gray-100 rounded"
                              title="Edit quantity & price"
                            >
                              <Edit3 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => quickRestock(p)}
                              className="p-1.5 hover:bg-gray-100 rounded"
                              title="Restock"
                            >
                              <RefreshCw className="w-4 h-4 text-gray-600" />
                            </button>
                            <Link
                              to={`/products/${p.id}`}
                              target="_blank"
                              className="p-1.5 hover:bg-gray-100 rounded"
                              title="View on Amazon"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Link>
                          </div>
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
    </div>
  )
}

function EmptyInventory({ tab, hasQuery }) {
  const messages = {
    all: 'No inventory yet. Add products from Manage Products.',
    fba: 'No FBA inventory. Set fulfillment to FBA in the product editor.',
    fbm: 'No FBM inventory.',
    low: 'No low-stock items. Everything is well stocked.',
    out: 'No out-of-stock items. Nice.',
    inbound: 'No inbound shipments.',
    reserved: 'No reserved inventory.',
  }
  return (
    <div className="p-12 text-center">
      <PackageX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">
        {hasQuery ? 'No inventory matches your search' : messages[tab] || 'No inventory'}
      </h3>
      {hasQuery && <p className="text-sm text-gray-600">Try a different keyword.</p>}
    </div>
  )
}