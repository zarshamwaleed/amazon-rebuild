import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserOrders } from '../services/orderService'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import OrderStatusBadge from '../components/OrderStatusBadge'

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>
        <LoadingSkeleton count={3} cols={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>
        <EmptyState title="Could not load orders" message={error} />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>
        <EmptyState
          title="You have no orders yet"
          message="Browse products and place your first order."
        />
        <div className="text-center mt-6">
          <Link
            to="/products"
            className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2.5 rounded transition"
          >
            Start shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const items = order.order_items || []
          const itemCount = items.reduce((s, i) => s + i.quantity, 0)
          return (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-md overflow-hidden"
            >
              {/* Order header strip */}
              <div className="bg-gray-50 border-b grid grid-cols-2 md:grid-cols-4 gap-4 px-5 py-3 text-xs">
                <div>
                  <div className="text-gray-500 uppercase tracking-wider">Order placed</div>
                  <div className="text-gray-900 font-medium mt-0.5">
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 uppercase tracking-wider">Total</div>
                  <div className="text-gray-900 font-medium mt-0.5">
                    ${Number(order.total).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 uppercase tracking-wider">Ship to</div>
                  <div className="text-gray-900 font-medium mt-0.5 line-clamp-1">
                    {order.addresses?.full_name || '—'}
                  </div>
                </div>
                <div className="text-right md:text-right">
                  <div className="text-gray-500 uppercase tracking-wider">Order #</div>
                  <div className="text-gray-900 font-mono mt-0.5 break-all text-[10px]">
                    {order.id.split('-')[0]}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <OrderStatusBadge status={order.order_status} />
                  <Link
                    to={'/orders/' + order.id}
                    className="text-sm text-blue-600 hover:text-[#c7511f] hover:underline"
                  >
                    View order details
                  </Link>
                </div>

                <div className="space-y-2">
                  {items.slice(0, 3).map((it) => (
                    <div key={it.id} className="flex items-center gap-3">
                      {it.product_image && (
                        <img
                          src={it.product_image}
                          alt=""
                          className="w-14 h-14 object-cover rounded border border-gray-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={'/products/' + it.product_id}
                          className="text-sm text-gray-900 hover:text-[#c7511f] line-clamp-1"
                        >
                          {it.product_title}
                        </Link>
                        <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                      </div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-xs text-gray-500 pl-1">
                      + {items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}
                    </div>
                  )}
                  {items.length === 0 && (
                    <div className="text-xs text-gray-500">No items recorded.</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
