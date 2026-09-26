import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserOrders } from '../services/orderService'
import EmptyState from '../components/EmptyState'
import OrderStatusBadge from '../components/OrderStatusBadge'
import Button from '../components/Button'
import { formatPrice } from '../lib/utils'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await getUserOrders(user.id)
        if (!cancelled) setOrders(data)
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
  }, [user])

  if (loading) {
    return (
      <div>
        <h1 className="heading-page mb-8">Your Orders</h1>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-bone-50 border border-stone-200 rounded-xl overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-4 px-5 sm:px-6 py-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="skeleton-shimmer h-8 rounded-md" />
                ))}
              </div>
              <div className="px-5 sm:px-6 py-5 space-y-3.5">
                <div className="skeleton-shimmer h-6 w-24 rounded-full mb-1" />
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3.5">
                    <div className="skeleton-shimmer w-14 h-14 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton-shimmer h-3 w-2/3 rounded-md" />
                      <div className="skeleton-shimmer h-3 w-1/4 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="heading-page mb-8">Your Orders</h1>
        <EmptyState title="Could not load orders" message={error} />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="heading-page mb-8">Your Orders</h1>
        <EmptyState
          icon={Package}
          title="You have no orders yet"
          message="Browse products and place your first order."
          action={
            <Link to="/products">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-page">Your Orders</h1>
        <p className="text-body-sm mt-1.5">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      <div className="space-y-5">
        {orders.map((order) => {
          const items = order.order_items || []
          return (
            <div
              key={order.id}
              className="bg-bone-50 border border-stone-200 rounded-xl overflow-hidden transition-avenzo hover:border-stone-300 hover:shadow-soft hover:-translate-y-0.5"
            >
              {/* Order header strip */}
              <div className="bg-stone-50 border-b border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-4 px-5 sm:px-6 py-4">
                <div>
                  <div className="text-label">Order placed</div>
                  <div className="text-sm text-charcoal-900 font-medium mt-1">
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-label">Total</div>
                  <div className="text-sm text-charcoal-900 font-medium mt-1">
                    {formatPrice(order.total)}
                  </div>
                </div>
                <div>
                  <div className="text-label">Ship to</div>
                  <div className="text-sm text-charcoal-900 font-medium mt-1 line-clamp-1">
                    {order.addresses?.full_name || '—'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-label">Order #</div>
                  <div className="text-xs text-charcoal-600 font-mono mt-1 break-all">
                    {order.id.split('-')[0]}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 sm:px-6 py-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <OrderStatusBadge status={order.order_status} />
                  <Link
                    to={'/orders/' + order.id}
                    className="text-sm font-medium text-charcoal-900 hover:text-brass-600 underline underline-offset-2"
                  >
                    View order details
                  </Link>
                </div>

                <div className="space-y-3">
                  {items.slice(0, 3).map((it) => (
                    <div key={it.id} className="flex items-center gap-3.5">
                      {it.product_image && (
                        <img
                          src={it.product_image}
                          alt=""
                          className="w-14 h-14 object-cover rounded-lg border border-stone-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={'/products/' + it.product_id}
                          className="text-sm text-charcoal-800 hover:text-charcoal-900 line-clamp-1"
                        >
                          {it.product_title}
                        </Link>
                        <div className="text-caption mt-0.5">Qty: {it.quantity}</div>
                      </div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-caption pl-1">
                      + {items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}
                    </div>
                  )}
                  {items.length === 0 && <div className="text-caption">No items recorded.</div>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
