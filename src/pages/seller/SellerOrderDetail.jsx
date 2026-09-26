import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Package,
  Truck,
  RotateCcw,
  MessageCircle,
  User,
  MapPin,
  CreditCard,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useSeller } from '../../hooks/useSeller'
import {
  getSellerOrder,
  updateOrderStatus,
} from '../../services/sellerService'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import ShippingLabelButton from '../../components/seller/ShippingLabelButton'
import RefundModal from '../../components/seller/RefundModal'
import ContactCustomerModal from '../../components/seller/ContactCustomerModal'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function SellerOrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { pushToast } = useToast()
  const { seller } = useSeller()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showRefund, setShowRefund] = useState(false)
  const [showContact, setShowContact] = useState(false)

  async function load() {
    if (!user || !id) return
    try {
      setLoading(true)
      const result = await getSellerOrder(user.id, id)
      setData(result)
    } catch {
      pushToast('Could not load order', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user, id])

  async function handleConfirmShipment() {
    if (!data) return
    setUpdating(true)
    try {
      const result = await updateOrderStatus(data.order.id, 'shipped')
      if (!result) {
        throw new Error(
          'Update blocked — check RLS policies on the orders table.'
        )
      }
      pushToast('Order marked as shipped', { type: 'success' })
      await load()
    } catch (err) {
      pushToast(err.message || 'Could not update order', { type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="h-16 rounded-xl skeleton-shimmer" />
        <div className="h-14 rounded-xl skeleton-shimmer" />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-72 rounded-xl skeleton-shimmer" />
          <div className="h-72 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="heading-sub mb-1">Order not found</h3>
          <p className="text-body-sm mb-4">
            This order does not exist or does not contain any of your products.
          </p>
          <Link to="/seller/orders" className="text-sm font-medium text-brass-600 hover:text-brass-700 transition-avenzo">
            ← Back to orders
          </Link>
        </div>
      </Card>
    )
  }

  const { order, seller_items } = data
  const itemCount = seller_items.reduce((s, i) => s + (i.quantity || 0), 0)
  const sellerTotal = seller_items.reduce(
    (s, i) => s + Number(i.price || 0) * (i.quantity || 0),
    0
  )
  const canShip = ['order_placed', 'pending', 'processing', 'confirmed'].includes(
    (order.order_status || '').toLowerCase()
  )

  return (
    <div className="space-y-6 pb-10">
      <SellerPageHeader
        backTo="/seller/orders"
        title={`Order #${order.id.slice(0, 8)}`}
        description={`Placed on ${new Date(order.created_at).toLocaleString()}`}
        actions={<OrderStatusBadge status={order.order_status} />}
      />

      {/* Actions bar */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-2">
          {canShip && (
            <Button onClick={handleConfirmShipment} loading={updating} size="md">
              <Truck className="w-4 h-4" />
              {updating ? 'Updating…' : 'Confirm Shipment'}
            </Button>
          )}
          <ShippingLabelButton order={order} seller={seller} size="md" />
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowRefund(true)}
            disabled={(order.order_status || '').toLowerCase() === 'refunded'}
          >
            <RotateCcw className="w-4 h-4" />
            {(order.order_status || '').toLowerCase() === 'refunded' ? 'Refunded' : 'Refund'}
          </Button>
          <Button variant="outline" size="md" onClick={() => setShowContact(true)}>
            <MessageCircle className="w-4 h-4" /> Contact Customer
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: items + customer + address */}
        <div className="lg:col-span-2 space-y-5">
          <Card
            padding="none"
            title={
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-charcoal-500" /> Items in this order
              </span>
            }
            footer={
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-600">
                  Your items total ({itemCount} unit{itemCount !== 1 ? 's' : ''})
                </span>
                <span className="font-semibold text-charcoal-900">${sellerTotal.toFixed(2)}</span>
              </div>
            }
          >
            <ul className="divide-y divide-stone-100">
              {seller_items.map((it) => (
                <li key={it.id} className="px-5 py-4 flex items-center gap-4">
                  {it.product_image ? (
                    <img
                      src={it.product_image}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-stone-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${it.product_id}`}
                      target="_blank"
                      className="text-sm font-medium text-charcoal-900 hover:text-brass-600 line-clamp-2 transition-avenzo"
                    >
                      {it.product_title}
                    </Link>
                    <div className="text-xs text-charcoal-500 mt-0.5">
                      Qty: {it.quantity} · ${Number(it.price).toFixed(2)} each
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-charcoal-900">
                      ${(Number(it.price) * it.quantity).toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid md:grid-cols-2 gap-5">
            <Card
              padding="md"
              title={
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-charcoal-500" /> Customer
                </span>
              }
            >
              <div className="text-sm text-charcoal-700">
                <div className="font-medium">{order.addresses?.full_name || '—'}</div>
                {order.addresses?.phone && (
                  <div className="text-xs text-charcoal-500 mt-0.5">
                    {order.addresses.phone}
                  </div>
                )}
              </div>
            </Card>

            <Card
              padding="md"
              title={
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-charcoal-500" /> Shipping address
                </span>
              }
            >
              <div className="text-sm text-charcoal-700 leading-relaxed">
                {order.addresses ? (
                  <>
                    <div className="font-medium">{order.addresses.full_name}</div>
                    <div>{order.addresses.address_line}</div>
                    <div>
                      {order.addresses.city}
                      {order.addresses.postal_code ? ', ' + order.addresses.postal_code : ''}
                    </div>
                    <div>{order.addresses.country}</div>
                  </>
                ) : (
                  <span className="text-charcoal-500">No address on file.</span>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right: totals + payment */}
        <div className="lg:col-span-1 space-y-5">
          <Card
            padding="md"
            title={
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-charcoal-500" /> Order summary
              </span>
            }
          >
            <dl className="text-sm space-y-2">
              <div className="flex justify-between text-charcoal-700">
                <dt>Order subtotal</dt>
                <dd>${Number(order.subtotal).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-charcoal-700">
                <dt>Shipping</dt>
                <dd>
                  {Number(order.shipping_fee) === 0
                    ? 'FREE'
                    : '$' + Number(order.shipping_fee).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between text-charcoal-700">
                <dt>Tax</dt>
                <dd>${Number(order.tax).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-stone-200 text-base font-semibold text-charcoal-900">
                <dt>Order total</dt>
                <dd>${Number(order.total).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-charcoal-700 pt-3 border-t border-stone-200">
                <dt>Payment method</dt>
                <dd className="capitalize">
                  {(order.payment_method || '').replace(/_/g, ' ')}
                </dd>
              </div>
              <div className="flex justify-between text-charcoal-700">
                <dt>Payment status</dt>
                <dd className="capitalize">{order.payment_status}</dd>
              </div>
            </dl>
            <div className="mt-4 text-xs text-charcoal-500 border-t border-stone-200 pt-3">
              Your share of this order: <strong className="text-charcoal-800">${sellerTotal.toFixed(2)}</strong>
            </div>
          </Card>

          <Card padding="md" title="Order status">
            <ol className="text-sm space-y-3">
              {[
                { key: 'order_placed', label: 'Order placed' },
                { key: 'processing', label: 'Processing' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'out_for_delivery', label: 'Out for delivery' },
                { key: 'delivered', label: 'Delivered' },
              ].map((s, i, arr) => {
                const order_steps = arr.map((x) => x.key)
                const current = (order.order_status || '').toLowerCase()
                const idx = order_steps.indexOf(current)
                const done = i <= idx
                const active = i === idx
                return (
                  <li key={s.key} className="flex items-center gap-3">
                    <span
                      className={
                        'w-2.5 h-2.5 rounded-full ' +
                        (done ? 'bg-success-500' : 'bg-stone-300')
                      }
                    />
                    <span
                      className={
                        active
                          ? 'text-brass-600 font-medium'
                          : done
                          ? 'text-charcoal-900'
                          : 'text-charcoal-400'
                      }
                    >
                      {s.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </Card>
        </div>
      </div>

      {showRefund && (
        <RefundModal
          order={order}
          sellerTotal={sellerTotal}
          sellerId={user.id}
          onClose={() => setShowRefund(false)}
          onRefunded={load}
        />
      )}

      {showContact && (
        <ContactCustomerModal
          order={order}
          sellerId={user.id}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  )
}
