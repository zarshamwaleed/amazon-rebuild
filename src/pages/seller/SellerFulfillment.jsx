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
  MessageCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import { useSeller } from '../../hooks/useSeller'
import {
  getSellerFulfillmentQueue,
  updateOrderStatus,
} from '../../services/sellerService'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import ShippingLabelButton from '../../components/seller/ShippingLabelButton'
import ContactCustomerModal from '../../components/seller/ContactCustomerModal'
import Card from '../../components/Card'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'

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
  const { seller } = useSeller()

  const [buckets, setBuckets] = useState({ FBA: [], FBM: [] })
  const [searchParams, setSearchParams] = useSearchParams()
  const [method, setMethod] = useState(() => {
    const t = (searchParams.get('tab') || 'FBM').toUpperCase()
    return t === 'FBA' ? 'FBA' : 'FBM'
  })
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showContact, setShowContact] = useState(false)

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
    } catch {
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
    <div className="space-y-6">
      <SellerPageHeader
        title="Fulfillment"
        description="Move orders through the fulfillment pipeline."
        actions={
          <Button variant="outline" size="md" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        }
      >
        {/* Method tabs */}
        <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
          {['FBM', 'FBA'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMethod(m)
                setSearchParams({ tab: m })
              }}
              className={
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-avenzo flex items-center gap-2 ' +
                (method === m
                  ? 'border-brass-500 text-charcoal-900'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-800')
              }
            >
              {m === 'FBA' ? 'FBA — Fulfilled by Amazon' : 'FBM — Fulfilled by Merchant'}
              <span
                className={
                  'text-xs px-1.5 py-0.5 rounded-full ' +
                  (method === m ? 'bg-brass-100 text-brass-700' : 'bg-stone-100 text-charcoal-600')
                }
              >
                {(buckets[m] || []).length}
              </span>
            </button>
          ))}
        </div>
      </SellerPageHeader>

      {loading ? (
        <div className="grid lg:grid-cols-[340px_1fr] gap-5">
          <div className="h-96 rounded-xl skeleton-shimmer" />
          <div className="h-96 rounded-xl skeleton-shimmer" />
        </div>
      ) : (buckets[method] || []).length === 0 ? (
        <EmptyState
          icon={Truck}
          title={`No ${method} orders in the queue`}
          message={`Orders will appear here when customers buy your ${method} products.`}
        />
      ) : (
        <div className="grid lg:grid-cols-[340px_1fr] gap-5">
          {/* List */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 text-label">
              Order queue
            </div>
            <ul className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
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
                        'w-full text-left px-4 py-3 transition-avenzo flex items-center gap-3 ' +
                        (active ? 'bg-brass-50' : 'hover:bg-stone-50')
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs text-charcoal-500">
                          #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-charcoal-900 truncate">
                          {seller_items[0]?.product_title || 'Order'}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-charcoal-500 mb-1">
                          Stage {stage + 1}/{PIPELINE.length}
                        </div>
                        <OrderStatusBadge status={order.order_status} />
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* Detail */}
          {selected && (
            <Card padding="lg" className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-label">Fulfilling order</div>
                  <h2 className="heading-sub font-mono">
                    #{selected.order.id.slice(0, 8)}
                  </h2>
                  <div className="text-xs text-charcoal-500 mt-1">
                    Customer: {selected.order.addresses?.full_name || '—'}
                  </div>
                </div>
                <Link
                  to={`/seller/orders/${selected.order.id}`}
                  className="text-xs text-brass-600 hover:text-brass-700 font-medium flex items-center gap-1 transition-avenzo"
                >
                  View full order <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Pipeline */}
              <div>
                <div className="text-label mb-3">Fulfillment status</div>
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
                              'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-avenzo ' +
                              (done
                                ? 'bg-success-500 border-success-500 text-bone-50'
                                : active
                                ? 'bg-brass-400 border-brass-400 text-charcoal-900'
                                : 'bg-bone-50 border-stone-300 text-charcoal-400')
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
                                ? 'font-semibold text-brass-700'
                                : done
                                ? 'text-charcoal-900'
                                : 'text-charcoal-500')
                            }
                          >
                            {step.label}
                          </span>
                        </div>
                        {i < PIPELINE.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-stone-300 mx-1 -mt-5" />
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>

              {/* Items */}
              <div>
                <div className="text-label mb-2">Items to fulfill</div>
                <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg">
                  {selected.seller_items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 p-3">
                      {it.product_image ? (
                        <img
                          src={it.product_image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-charcoal-900 truncate">
                          {it.product_title}
                        </div>
                        <div className="text-xs text-charcoal-500">
                          Qty: {it.quantity} · ${Number(it.price).toFixed(2)} each
                        </div>
                      </div>
                      <div className="text-sm font-medium text-charcoal-900">
                        ${(Number(it.price) * it.quantity).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Address */}
              {selected.order.addresses && (
                <div>
                  <div className="text-label mb-2">Shipping address</div>
                  <div className="text-sm text-charcoal-700 leading-relaxed border border-stone-200 rounded-lg p-3 bg-stone-50">
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
              <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-200">
                {stageIndex(
                  (selected.order.order_status || 'order_placed').toLowerCase()
                ) <
                  PIPELINE.length - 1 && (
                  <Button onClick={handleAdvance} loading={updating} size="lg">
                    <Send className="w-4 h-4" />
                    {updating
                      ? 'Updating…'
                      : 'Advance to ' +
                        PIPELINE[
                          stageIndex(
                            (selected.order.order_status || 'order_placed').toLowerCase()
                          ) + 1
                        ].label}
                  </Button>
                )}
                <ShippingLabelButton order={selected.order} seller={seller} size="lg" />
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowContact(true)}
                >
                  <MessageCircle className="w-4 h-4" /> Contact customer
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {showContact && selected && (
        <ContactCustomerModal
          order={selected.order}
          sellerId={user.id}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  )
}
