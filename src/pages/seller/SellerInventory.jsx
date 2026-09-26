import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Package,
  PackageX,
  Edit3,
  RefreshCw,
  Eye,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerInventory, updateInventory } from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    return t && TABS.find((x) => x.id === t) ? t : 'all'
  })
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // { id, stock, price }

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSellerInventory(user.id)
      setItems(data)
    } catch {
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
    } catch {
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
    if (p.available === 0) return { label: 'Out of stock', color: 'red' }
    if (p.available <= (p.low_stock_threshold || 5)) return { label: 'Low stock', color: 'yellow' }
    return { label: 'In stock', color: 'green' }
  }

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Manage Inventory"
        description={`${items.length} SKU${items.length !== 1 ? 's' : ''} in your catalog`}
        actions={
          <Button variant="outline" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        }
      >
        <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id)
                if (t.id === 'all') setSearchParams({})
                else setSearchParams({ tab: t.id })
              }}
              className={
                'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-avenzo flex items-center gap-2 ' +
                (tab === t.id
                  ? 'border-brass-500 text-charcoal-900'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-800')
              }
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span
                  className={
                    'text-xs px-1.5 py-0.5 rounded-full ' +
                    (tab === t.id ? 'bg-brass-100 text-brass-700' : 'bg-stone-100 text-charcoal-500')
                  }
                >
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </SellerPageHeader>

      {/* Search */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-charcoal-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search inventory by product or SKU…"
          className="flex-1 text-sm bg-transparent text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-14 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-2">
            <EmptyInventory tab={tab} hasQuery={query.length > 0} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-label text-left px-5 py-3">Product</th>
                  <th className="text-label text-left px-4 py-3">SKU</th>
                  <th className="text-label text-right px-4 py-3">Available</th>
                  <th className="text-label text-right px-4 py-3">Reserved</th>
                  <th className="text-label text-right px-4 py-3">Inbound</th>
                  <th className="text-label text-right px-4 py-3">Price</th>
                  <th className="text-label text-center px-4 py-3">Fulfillment</th>
                  <th className="text-label text-center px-4 py-3">Status</th>
                  <th className="text-label text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((p) => {
                  const status = statusFor(p)
                  const isEditing = editing?.id === p.id
                  const low = p.available > 0 && p.available <= (p.low_stock_threshold || 5)
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
                            {low && (
                              <div className="text-xs text-warning-700 flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3" /> Low stock
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-500 font-mono text-xs">
                        {p.sku || '—'}
                      </td>

                      {/* Available — editable */}
                      <td className="px-4 py-3.5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editing.stock}
                            onChange={(e) => setEditing((s) => ({ ...s, stock: e.target.value }))}
                            className="w-20 text-right border border-stone-300 rounded-lg px-2 py-1 text-sm bg-bone-50 focus:outline-none focus:border-brass-400"
                          />
                        ) : (
                          <span className={p.available === 0 ? 'text-error-700' : 'text-charcoal-900'}>
                            {p.available}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right text-charcoal-500">{p.reserved || 0}</td>
                      <td className="px-4 py-3.5 text-right text-charcoal-500">{p.inbound || 0}</td>

                      {/* Price — editable */}
                      <td className="px-4 py-3.5 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editing.price}
                            onChange={(e) => setEditing((s) => ({ ...s, price: e.target.value }))}
                            className="w-24 text-right border border-stone-300 rounded-lg px-2 py-1 text-sm bg-bone-50 focus:outline-none focus:border-brass-400"
                          />
                        ) : (
                          <span className="text-charcoal-900">${Number(p.price || 0).toFixed(2)}</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Badge color="gray">{p.fulfillment_method || 'FBM'}</Badge>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Badge color={status.color}>{status.label}</Badge>
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(p)}
                              className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                              title="Edit quantity & price"
                            >
                              <Edit3 className="w-4 h-4 text-charcoal-600" />
                            </button>
                            <button
                              onClick={() => quickRestock(p)}
                              className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                              title="Restock"
                            >
                              <RefreshCw className="w-4 h-4 text-charcoal-600" />
                            </button>
                            <Link
                              to={`/products/${p.id}`}
                              target="_blank"
                              className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                              title="View on Avenzo"
                            >
                              <Eye className="w-4 h-4 text-charcoal-600" />
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
    <EmptyState
      icon={PackageX}
      title={hasQuery ? 'No inventory matches your search' : messages[tab] || 'No inventory'}
      message={hasQuery ? 'Try a different keyword.' : undefined}
    />
  )
}
