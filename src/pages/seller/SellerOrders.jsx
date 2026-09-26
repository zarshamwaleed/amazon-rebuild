import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Search,
  RefreshCw,
  ChevronRight,
  RotateCcw,
  MessageCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useSeller } from '../../hooks/useSeller'
import { getSellerOrders } from '../../services/sellerService'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import ShippingLabelButton from '../../components/seller/ShippingLabelButton'
import RefundModal from '../../components/seller/RefundModal'
import ContactCustomerModal from '../../components/seller/ContactCustomerModal'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'

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
  const { seller } = useSeller()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [refundOrder, setRefundOrder] = useState(null)
  const [contactOrder, setContactOrder] = useState(null)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSellerOrders(user.id)
      setRows(data)
    } catch {
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
    <div className="space-y-6">
      <SellerPageHeader
        title="Manage Orders"
        description={`${rows.length} order${rows.length !== 1 ? 's' : ''} containing your products`}
        actions={
          <Button variant="outline" size="md" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        }
      >
        {/* Tabs */}
        <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-avenzo flex items-center gap-2 ' +
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
                    (tab === t.id ? 'bg-brass-100 text-brass-700' : 'bg-stone-100 text-charcoal-600')
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
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex flex-wrap items-center gap-3">
        <Search className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order ID, product, or customer..."
          className="flex-1 min-w-[200px] text-sm bg-transparent text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyOrders tab={tab} hasQuery={query.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-label text-left px-5 py-3">Order ID</th>
                  <th className="text-label text-left px-4 py-3">Date</th>
                  <th className="text-label text-left px-4 py-3">Product</th>
                  <th className="text-label text-left px-4 py-3">Customer</th>
                  <th className="text-label text-right px-4 py-3">Qty</th>
                  <th className="text-label text-right px-4 py-3">Total</th>
                  <th className="text-label text-center px-4 py-3">Status</th>
                  <th className="text-label text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(({ order, seller_items }) => {
                  const itemCount = seller_items.reduce((s, i) => s + (i.quantity || 0), 0)
                  const sellerTotal = seller_items.reduce(
                    (s, i) => s + Number(i.price || 0) * (i.quantity || 0),
                    0
                  )
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-avenzo">
                      <td className="px-5 py-3.5 font-mono text-xs text-charcoal-500">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-700">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {seller_items[0]?.product_image && (
                            <img
                              src={seller_items[0].product_image}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-stone-200"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-charcoal-900 truncate max-w-xs">
                              {seller_items[0]?.product_title || '—'}
                            </div>
                            {seller_items.length > 1 && (
                              <div className="text-xs text-charcoal-500">
                                +{seller_items.length - 1} more item
                                {seller_items.length > 2 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-700">
                        {order.addresses?.full_name || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-charcoal-700">{itemCount}</td>
                      <td className="px-4 py-3.5 text-right text-charcoal-900 font-medium">
                        ${sellerTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <OrderStatusBadge status={order.order_status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ShippingLabelButton order={order} seller={seller} iconOnly />
                          <button
                            type="button"
                            onClick={() => setRefundOrder({ order, sellerTotal })}
                            disabled={(order.order_status || '').toLowerCase() === 'refunded'}
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-stone-100 transition-avenzo disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Refund order"
                            title="Refund order"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setContactOrder(order)}
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-stone-100 transition-avenzo"
                            aria-label="Contact customer"
                            title="Contact customer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/seller/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-brass-600 hover:text-brass-700 text-sm font-medium transition-avenzo ml-1"
                          >
                            View <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {refundOrder && (
        <RefundModal
          order={refundOrder.order}
          sellerTotal={refundOrder.sellerTotal}
          sellerId={user.id}
          onClose={() => setRefundOrder(null)}
          onRefunded={load}
        />
      )}

      {contactOrder && (
        <ContactCustomerModal
          order={contactOrder}
          sellerId={user.id}
          onClose={() => setContactOrder(null)}
        />
      )}
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
    <EmptyState
      icon={ShoppingCart}
      title={hasQuery ? 'No orders match your search' : 'No orders'}
      message={hasQuery ? 'Try a different keyword.' : messages[tab] || 'No orders'}
      className="border-0 rounded-none"
    />
  )
}
