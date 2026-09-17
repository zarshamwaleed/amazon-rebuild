import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrderById } from '../services/orderService'
import EmptyState from '../components/EmptyState'
import OrderStatusBadge from '../components/OrderStatusBadge'
import OrderStatusTimeline from '../components/OrderStatusTimeline'

function formatDate(iso, withTime = false) {
  const d = new Date(iso)
  const opts = { year: 'numeric', month: 'long', day: 'numeric' }
  if (withTime) {
    opts.hour = 'numeric'
    opts.minute = '2-digit'
  }
  return d.toLocaleDateString('en-US', opts)
}

export default function OrderDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || !id) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await getOrderById(id)
        if (cancelled) return
        if (!data || data.user_id !== user.id) {
          setError('not_found')
        } else {
          setOrder(data)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, user])

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-600">Loading order…</div>
  }

  if (error === 'not_found' || (!loading && !order)) {
    return (
      <EmptyState
        title="Order not found"
        message="This order does not exist or does not belong to you."
      />
    )
  }
  if (error) {
    return <EmptyState title="Could not load order" message={error} />
  }

  const items = order.order_items || []
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div>
      <nav className="text-xs text-gray-600 mb-4">
        <Link to="/orders" className="hover:underline">Your Orders</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">Order {order.id.split('-')[0]}</span>
      </nav>

      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        <OrderStatusBadge status={order.order_status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: items + address */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-gray-200 rounded-md p-5">
            <div className="grid grid-cols-2 gap-4 text-sm mb-4 pb-4 border-b">
              <div>
                <div className="text-gray-500">Order placed</div>
                <div className="text-gray-900 font-medium">
                  {formatDate(order.created_at, true)}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Order number</div>
                <div className="text-gray-900 font-mono break-all text-xs">
                  {order.id}
                </div>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Items ({itemCount})
            </h2>
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.id} className="py-3 flex items-center gap-3">
                  {it.product_image && (
                    <img
                      src={it.product_image}
                      alt=""
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={'/products/' + it.product_id}
                      className="text-sm text-gray-900 hover:text-[#c7511f] line-clamp-2"
                    >
                      {it.product_title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-0.5">Qty: {it.quantity}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${(Number(it.price) * it.quantity).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-gray-200 rounded-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping address</h2>
            {order.addresses ? (
              <div className="text-sm text-gray-700 leading-relaxed">
                <div className="font-medium text-gray-900">{order.addresses.full_name}</div>
                <div>{order.addresses.address_line}</div>
                <div>
                  {order.addresses.city}
                  {order.addresses.postal_code ? ', ' + order.addresses.postal_code : ''}
                </div>
                <div>{order.addresses.country}</div>
                {order.addresses.phone && (
                  <div className="text-xs text-gray-500 mt-1">{order.addresses.phone}</div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No address on file.</p>
            )}
          </section>
        </div>

        {/* Right: timeline + summary */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white border border-gray-200 rounded-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order status</h2>
            <OrderStatusTimeline status={order.order_status} />
          </section>

          <section className="bg-white border border-gray-200 rounded-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Order summary</h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between text-gray-700">
                <dt>Subtotal</dt>
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
                <dt>Total</dt>
                <dd>${Number(order.total).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-gray-700 pt-3 border-t">
                <dt>Payment</dt>
                <dd className="capitalize">{order.payment_method.replace(/_/g, ' ')}</dd>
              </div>
              <div className="flex justify-between text-gray-700">
                <dt>Payment status</dt>
                <dd className="capitalize">{order.payment_status}</dd>
              </div>
            </dl>
          </section>

          <Link
            to="/products"
            className="block text-center bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded transition"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
