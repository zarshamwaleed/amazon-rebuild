import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Search,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerOrders } from '../../services/sellerService'
import OrderStatusBadge from '../../components/OrderStatusBadge'

const TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'unshipped', label: 'Unshipped' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'returns', label: 'Returns' },
  { id: 'claims', label: 'Claims' },
]

function matchesTab(orderStatus, tab) {
  const s = (orderStatus || '').toLowerCase()
  switch (tab) {
    case 'all':
      return true
    case 'pending':
      return s === 'order_placed' || s === 'pending' || s === 'processing'
    case 'unshipped':
      return s === 'order_placed' || s === 'processing' || s === 'confirmed'
    case 'shipped':
      return s === 'shipped' || s === 'out_for_delivery' || s === 'delivered'
    case 'cancelled':
      return s === 'cancelled'
    case 'returns':
      return s === 'returned' || s === 'return_requested'
    case 'claims':
      return s === 'claim_open' || s === 'claim'
    default:
      return true
  }
}

export default function SellerOrders() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSellerOrders(user.id)
      setRows(data)
    } catch (err) {
      pushToast('Could not load orders', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const filtered = useMemo(() => {
    let list = rows
    if (tab !== 'all') {
      list = list.filter(({ order }) => matchesTab(order.order_status, tab))
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(({ order, seller_items }) => {
        const idMatch = order.id.toLowerCase().includes(q)
        const itemMatch = seller_items.some((it) =>
          (it.product_title || '').toLowerCase().includes(q)
        )
        const addressMatch = (order.addresses?.full_name || '').toLowerCase().includes(q)
        return idMatch || itemMatch || addressMatch
      })
    }
    return list
  }, [rows, tab, query])

  const counts = useMemo(() => {
    const c = { all: rows.length, pending: 0, unshipped: 0, shipped: 0, cancelled: 0, returns: 0, claims: 0 }
    for (const { order } of rows) {
      for (const t of ['pending', 'unshipped', 'shipped', 'cancelled', 'returns', 'claims']) {
        if (matchesTab(order.order_status, t)) c[t]++
      }
    }
    return c
  }, [rows])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-600">
            {rows.length} order{rows.length !== 1 ? 's' : ''} containing your products
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
          placeholder="Search by order ID, product, or customer..."
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-600">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <EmptyOrders tab={tab} hasQuery={query.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Order ID</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-right px-4 py-3">Qty</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ order, seller_items }) => {
                  const itemCount = seller_items.reduce((s, i) => s + (i.quantity || 0), 0)
                  const sellerTotal = seller_items.reduce(
                    (s, i) => s + Number(i.price || 0) * (i.quantity || 0),
                    0
                  )
                  return (
                    <tr key={order.id} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {seller_items[0]?.product_image && (
                            <img
                              src={seller_items[0].product_image}
                              alt=""
                              className="w-8 h-8 rounded object-cover border"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-gray-900 truncate max-w-xs">
                              {seller_items[0]?.product_title || '—'}
                            </div>
                            {seller_items.length > 1 && (
                              <div className="text-xs text-gray-500">
                                +{seller_items.length - 1} more item
                                {seller_items.length > 2 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {order.addresses?.full_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{itemCount}</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        ${sellerTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <OrderStatusBadge status={order.order_status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/seller/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-[#007185] hover:text-[#c7511f] text-sm hover:underline"
                        >
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
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

function EmptyOrders({ tab, hasQuery }) {
  const messages = {
    all: 'No orders yet. Orders will show here after customers buy your products.',
    pending: 'No pending orders.',
    unshipped: 'No unshipped orders.',
    shipped: 'No shipped orders yet.',
    cancelled: 'No cancelled orders.',
    returns: 'No returns.',
    claims: 'No claims.',
  }
  return (
    <div className="p-12 text-center">
      <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">
        {hasQuery ? 'No orders match your search' : messages[tab] || 'No orders'}
      </h3>
      {hasQuery && <p className="text-sm text-gray-600">Try a different keyword.</p>}
    </div>
  )
}