import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  Truck,
  FileText,
  RotateCcw,
  MessageCircle,
  User,
  MapPin,
  CreditCard,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerOrder,
  updateOrderStatus,
} from '../../services/sellerService'
import OrderStatusBadge from '../../components/OrderStatusBadge'

export default function SellerOrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  async function load() {
    if (!user || !id) return
    try {
      setLoading(true)
      const result = await getSellerOrder(user.id, id)
      setData(result)
    } catch (err) {
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

  function handleSimulated(action) {
    pushToast(action + ' — simulated in this demo', { type: 'info' })
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading order…</div>
  }

  if (!data) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <h3 className="font-semibold text-gray-900 mb-1">Order not found</h3>
        <p className="text-sm text-gray-600 mb-4">
          This order does not exist or does not contain any of your products.
        </p>
        <Link to="/seller/orders" className="text-[#007185] hover:underline text-sm">
          ← Back to orders
        </Link>
      </div>
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
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/seller/orders"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-600">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <OrderStatusBadge status={order.order_status} />
      </div>

      {/* Actions bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap gap-2">
        {canShip && (
          <button
            onClick={handleConfirmShipment}
            disabled={updating}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 text-sm transition disabled:opacity-60"
          >
            <Truck className="w-4 h-4" />
            {updating ? 'Updating…' : 'Confirm Shipment'}
          </button>
        )}
        <button
          onClick={() => handleSimulated('Printing shipping label')}
          className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded flex items-center gap-2 text-sm"
        >
          <FileText className="w-4 h-4" /> Print Shipping Label
        </button>
        <button
          onClick={() => handleSimulated('Refunding order')}
          className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded flex items-center gap-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Refund
        </button>
        <button
          onClick={() => handleSimulated('Contacting customer')}
          className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded flex items-center gap-2 text-sm"
        >
          <MessageCircle className="w-4 h-4" /> Contact Customer
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: items + customer + address */}
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-3 border-b flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-600" />
              <h2 className="font-bold text-gray-900">Items in this order</h2>
            </div>
            <ul className="divide-y">
              {seller_items.map((it) => (
                <li key={it.id} className="px-5 py-4 flex items-center gap-4">
                  {it.product_image ? (
                    <img
                      src={it.product_image}
                      alt=""
                      className="w-14 h-14 rounded object-cover border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded bg-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${it.product_id}`}
                      target="_blank"
                      className="text-sm font-medium text-gray-900 hover:text-[#c7511f] line-clamp-2"
                    >
                      {it.product_title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Qty: {it.quantity} · ${Number(it.price).toFixed(2)} each
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${(Number(it.price) * it.quantity).toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-5 py-3 border-t bg-gray-50 flex justify-between text-sm">
              <span className="text-gray-600">
                Your items total ({itemCount} unit{itemCount !== 1 ? 's' : ''})
              </span>
              <span className="font-bold text-gray-900">${sellerTotal.toFixed(2)}</span>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-5">
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Customer
              </h2>
              <div className="text-sm text-gray-700">
                <div className="font-medium">{order.addresses?.full_name || '—'}</div>
                {order.addresses?.phone && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {order.addresses.phone}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping address
              </h2>
              <div className="text-sm text-gray-700 leading-relaxed">
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
                  <span className="text-gray-500">No address on file.</span>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Right: totals + payment */}
        <div className="lg:col-span-1 space-y-5">
          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Order summary
            </h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between text-gray-700">
                <dt>Order subtotal</dt>
                <dd>${Number(order.subtotal).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-gray-700">
                <dt>Shipping</dt>
                <dd>
                  {Number(order.shipping_fee) === 0
                    ? 'FREE'
                    : '$' + Number(order.shipping_fee).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between text-gray-700">
                <dt>Tax</dt>
                <dd>${Number(order.tax).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between pt-3 border-t text-base font-bold text-gray-900">
                <dt>Order total</dt>
                <dd>${Number(order.total).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-gray-700 pt-3 border-t">
                <dt>Payment method</dt>
                <dd className="capitalize">
                  {(order.payment_method || '').replace(/_/g, ' ')}
                </dd>
              </div>
              <div className="flex justify-between text-gray-700">
                <dt>Payment status</dt>
                <dd className="capitalize">{order.payment_status}</dd>
              </div>
            </dl>
            <div className="mt-4 text-xs text-gray-500 border-t pt-3">
              Your share of this order: <strong>${sellerTotal.toFixed(2)}</strong>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900 mb-3">Order status</h2>
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
                        (done ? 'bg-green-600' : 'bg-gray-300')
                      }
                    />
                    <span
                      className={
                        (active
                          ? 'text-[#c7511f] font-medium'
                          : done
                          ? 'text-gray-900'
                          : 'text-gray-400')
                      }
                    >
                      {s.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>
      </div>
    </div>
  )
}