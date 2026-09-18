import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Truck,
  RefreshCw,
  ChevronRight,
  Check,
  Boxes,
  CircleDot,
  Send,
  Home,
  FileText,
  ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import {
  getSellerFulfillmentQueue,
  updateOrderStatus,
} from '../../services/sellerService'
import OrderStatusBadge from '../../components/OrderStatusBadge'

const PIPELINE = [
  { key: 'order_placed', label: 'Order Received', icon: CircleDot },
  { key: 'processing', label: 'Processing', icon: Boxes },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Send },
  { key: 'delivered', label: 'Delivered', icon: Home },
]

function stageIndex(status) {
  const idx = PIPELINE.findIndex((s) => s.key === status)
  return idx === -1 ? 0 : idx
}

function nextStage(status) {
  const i = stageIndex(status)
  return PIPELINE[Math.min(i + 1, PIPELINE.length - 1)].key
}

export default function SellerFulfillment() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [buckets, setBuckets] = useState({ FBA: [], FBM: [] })
    const [searchParams, setSearchParams] = useSearchParams()
  const [method, setMethod] = useState(() => {
    const t = (searchParams.get('tab') || 'FBM').toUpperCase()
    return t === 'FBA' ? 'FBA' : 'FBM'
  })
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSellerFulfillmentQueue(user.id)
      setBuckets(data)
      // Auto-select first order in current tab
      const list = data[method] || []
      if (list.length > 0) setSelectedId(list[0].order.id)
      else setSelectedId(null)
    } catch (err) {
      pushToast('Could not load fulfillment queue', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  useEffect(() => {
    // Re-auto-select when tab changes
    const list = buckets[method] || []
    if (list.length > 0) {
      const stillThere = list.some((o) => o.order.id === selectedId)
      if (!stillThere) setSelectedId(list[0].order.id)
    } else {
      setSelectedId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, buckets])

  const selected = useMemo(() => {
    const list = buckets[method] || []
    return list.find((r) => r.order.id === selectedId) || null
  }, [buckets, method, selectedId])

  async function handleAdvance() {
    if (!selected) return
    const current = (selected.order.order_status || 'order_placed').toLowerCase()
    const next = nextStage(current)
    if (next === current) {
      pushToast('Order already delivered', { type: 'info' })
      return
    }
    setUpdating(true)
    try {
      const result = await updateOrderStatus(selected.order.id, next)
      if (!result) {
        throw new Error('Update blocked — check RLS policies on orders.')
      }
      pushToast(
        'Advanced to ' +
          PIPELINE.find((s) => s.key === next).label,
        { type: 'success' }
      )
      await load()
    } catch (err) {
      pushToast(err.message || 'Could not update', { type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fulfillment</h1>
          <p className="text-sm text-gray-600">
            Move orders through the fulfillment pipeline.
          </p>
        </div>
        <button
          onClick={load}
          className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Method tabs */}
      <div className="flex gap-2">
        {['FBM', 'FBA'].map((m) => (
          <button
            key={m}
                        onClick={() => {
              setMethod(m)
              setSearchParams({ tab: m })
            }}
            className={
              'px-4 py-2 text-sm font-medium rounded-full border-2 transition flex items-center gap-2 ' +
              (method === m
                ? 'border-[#c7511f] bg-orange-50 text-[#c7511f]'
                : 'border-gray-200 hover:border-gray-400 text-gray-700 bg-white')
            }
          >
            {m === 'FBA' ? 'FBA — Fulfilled by Amazon' : 'FBM — Fulfilled by Merchant'}
            <span
              className={
                'text-xs px-1.5 py-0.5 rounded-full ' +
                (method === m ? 'bg-orange-100 text-[#c7511f]' : 'bg-gray-100 text-gray-600')
              }
            >
              {(buckets[m] || []).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-600">
          Loading queue…
        </div>
      ) : (buckets[method] || []).length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">
            No {method} orders in the queue
          </h3>
          <p className="text-sm text-gray-600">
            Orders will appear here when customers buy your {method} products.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[340px_1fr] gap-5">
          {/* List */}
          <aside className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              Order queue
            </div>
            <ul className="divide-y max-h-[600px] overflow-y-auto">
              {(buckets[method] || []).map(({ order, seller_items }) => {
                const active = selected?.order.id === order.id
                const stage = stageIndex(
                  (order.order_status || 'order_placed').toLowerCase()
                )
                return (
                  <li key={order.id}>
                    <button
                      onClick={() => setSelectedId(order.id)}
                      className={
                        'w-full text-left px-4 py-3 transition flex items-center gap-3 ' +
                        (active ? 'bg-orange-50' : 'hover:bg-gray-50')
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs text-gray-500">
                          #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-gray-900 truncate">
                          {seller_items[0]?.product_title || 'Order'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">
                          Stage {stage + 1}/{PIPELINE.length}
                        </div>
                        <OrderStatusBadge status={order.order_status} />
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Detail */}
          {selected && (
            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500">
                    Fulfilling order
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 font-mono">
                    #{selected.order.id.slice(0, 8)}
                  </h2>
                  <div className="text-xs text-gray-500 mt-1">
                    Customer: {selected.order.addresses?.full_name || '—'}
                  </div>
                </div>
                <Link
                  to={`/seller/orders/${selected.order.id}`}
                  className="text-xs text-[#007185] hover:underline flex items-center gap-1"
                >
                  View full order <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Pipeline */}
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                  Fulfillment status
                </div>
                <ol className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
                  {PIPELINE.map((step, i) => {
                    const current = stageIndex(
                      (selected.order.order_status || 'order_placed').toLowerCase()
                    )
                    const done = i < current
                    const active = i === current
                    const Icon = step.icon
                    return (
                      <li key={step.key} className="flex items-center flex-shrink-0">
                        <div className="flex flex-col items-center gap-1 min-w-[88px]">
                          <div
                            className={
                              'w-10 h-10 rounded-full flex items-center justify-center border-2 transition ' +
                              (done
                                ? 'bg-green-600 border-green-600 text-white'
                                : active
                                ? 'bg-[#febd69] border-[#febd69] text-gray-900'
                                : 'bg-white border-gray-300 text-gray-400')
                            }
                          >
                            {done ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <span
                            className={
                              'text-xs text-center ' +
                              (active
                                ? 'font-bold text-[#c7511f]'
                                : done
                                ? 'text-gray-900'
                                : 'text-gray-500')
                            }
                          >
                            {step.label}
                          </span>
                        </div>
                        {i < PIPELINE.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-gray-300 mx-1 -mt-5" />
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>

              {/* Items */}
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Items to fulfill
                </div>
                <ul className="divide-y border rounded-lg">
                  {selected.seller_items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 p-3">
                      {it.product_image ? (
                        <img
                          src={it.product_image}
                          alt=""
                          className="w-12 h-12 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">
                          {it.product_title}
                        </div>
                        <div className="text-xs text-gray-500">
                          Qty: {it.quantity} · ${Number(it.price).toFixed(2)} each
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ${(Number(it.price) * it.quantity).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Address */}
              {selected.order.addresses && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Shipping address
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed border rounded-lg p-3 bg-gray-50">
                    <div className="font-medium">{selected.order.addresses.full_name}</div>
                    <div>{selected.order.addresses.address_line}</div>
                    <div>
                      {selected.order.addresses.city}
                      {selected.order.addresses.postal_code
                        ? ', ' + selected.order.addresses.postal_code
                        : ''}
                    </div>
                    <div>{selected.order.addresses.country}</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {stageIndex(
                  (selected.order.order_status || 'order_placed').toLowerCase()
                ) <
                  PIPELINE.length - 1 && (
                  <button
                    onClick={handleAdvance}
                    disabled={updating}
                    className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded flex items-center gap-2 transition disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    {updating
                      ? 'Updating…'
                      : 'Advance to ' +
                        PIPELINE[
                          stageIndex(
                            (selected.order.order_status || 'order_placed').toLowerCase()
                          ) + 1
                        ].label}
                  </button>
                )}
                <button
                  onClick={() =>
                    pushToast('Shipping label — simulated in this demo', {
                      type: 'info',
                    })
                  }
                  className="border border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" /> Print label
                </button>
                <button
                  onClick={() =>
                    pushToast('Contact customer — simulated in this demo', {
                      type: 'info',
                    })
                  }
                  className="border border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded flex items-center gap-2 text-sm"
                >
                  Contact customer
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}