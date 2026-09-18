import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Gift, Copy, Mail } from 'lucide-react'
import { getOrderById } from '../services/orderService'
import { getGiftCardsForOrder } from '../services/giftCardService'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'

export default function OrderConfirmation() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [giftCards, setGiftCards] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await getOrderById(id)
        if (cancelled) return
        if (!data || data.user_id !== user?.id) {
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
    if (id && user) load()
    return () => {
      cancelled = true
    }
  }, [id, user])

  useEffect(() => {
    if (!id) return
    getGiftCardsForOrder(id).then(setGiftCards).catch(() => {})
  }, [id])

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-600">Loading order…</div>
  }
  if (error === 'not_found' || !order) {
    return (
      <EmptyState
        title="Order not found"
        message="This order does not exist or does not belong to you."
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="text-center mb-8">
        <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900">Order placed, thank you!</h1>
        <p className="text-sm text-gray-600 mt-1">
          A confirmation has been sent to your email.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Order number</div>
            <div className="font-medium text-gray-900 break-all">{order.id}</div>
          </div>
          <div>
            <div className="text-gray-500">Order total</div>
            <div className="font-medium text-gray-900">${Number(order.total).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">Payment method</div>
            <div className="font-medium text-gray-900">{order.payment_method}</div>
          </div>
          <div>
            <div className="text-gray-500">Status</div>
            <div className="font-medium text-gray-900 capitalize">
              {order.order_status.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {order.addresses && (
          <div className="border-t pt-4 text-sm">
            <div className="font-medium text-gray-900 mb-1">Shipping to</div>
            <div className="text-gray-700">
              {order.addresses.full_name}
              <br />
              {order.addresses.address_line}
              <br />
              {order.addresses.city}
              {order.addresses.postal_code ? ', ' + order.addresses.postal_code : ''}
              <br />
              {order.addresses.country}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="font-medium text-gray-900 mb-2">Items</div>
          <ul className="divide-y text-sm">
            {order.order_items?.map((it) => (
              <li key={it.id} className="py-2 flex items-center gap-3">
                {it.product_image && (
                  <img
                    src={it.product_image}
                    alt=""
                    className="w-12 h-12 object-cover rounded border"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    to={'/products/' + it.product_id}
                    className="text-gray-900 hover:text-[#c7511f] line-clamp-1"
                  >
                    {it.product_title}
                  </Link>
                  <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                </div>
                <div className="font-medium text-gray-900">
                  ${(Number(it.price) * it.quantity).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-4 flex gap-3 flex-wrap">
          <Link
            to="/orders"
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded transition text-sm"
          >
            View your orders
          </Link>
          <Link
            to="/products"
            className="border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium px-5 py-2 rounded transition text-sm"
          >
            Continue shopping
          </Link>
          {order.registry_id && (
            <Link
              to={`/registry/${order.registry_id}`}
              className="border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium px-5 py-2 rounded transition text-sm"
            >
              View Registry
            </Link>
          )}
        </div>
      </div>

      {giftCards.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#c7511f]" /> Your Gift Cards
          </h2>
          <p className="text-sm text-gray-600">
            {giftCards.length === 1
              ? 'Your gift card has been issued. Share the claim code with the recipient.'
              : 'Your gift cards have been issued. Share each claim code with its recipient.'}
          </p>
          <div className="space-y-4">
            {giftCards.map((gc) => (
              <div
                key={gc.id}
                className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    {gc.delivery_method === 'email'
                      ? 'Email gift card'
                      : gc.delivery_method === 'print'
                      ? 'Print at home'
                      : 'Physical gift card'}
                  </div>
                  <div className="font-bold text-gray-900 text-lg">
                    ${Number(gc.amount).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <strong>To:</strong> {gc.recipient_name}
                    {gc.recipient_email ? ` · ${gc.recipient_email}` : ''}
                  </div>
                  {gc.message && (
                    <div className="text-xs text-gray-500 mt-1 italic">
                      "{gc.message}"
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Claim code
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-base font-mono font-bold bg-gray-50 border border-gray-200 rounded px-3 py-1.5">
                      {gc.code}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(gc.code)
                      }}
                      className="p-2 rounded border border-gray-300 hover:bg-gray-50"
                      title="Copy claim code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recipient redeems at{' '}
                    <span className="font-mono">/gift-cards/redeem</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}