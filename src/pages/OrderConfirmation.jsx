import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, Copy, Gift, Home, Loader2, Package, Truck } from 'lucide-react'
import { getOrderById } from '../services/orderService'
import { getGiftCardsForOrder } from '../services/giftCardService'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../lib/utils'

const NEXT_STEPS = [
  { id: 'order_placed', label: 'Order placed', icon: CheckCircle },
  { id: 'processing', label: 'Preparing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home },
]

export default function OrderConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
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
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-charcoal-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-body-sm">Loading order…</span>
      </div>
    )
  }
  if (error === 'not_found' || !order) {
    return (
      <EmptyState title="Order not found" message="This order does not exist or does not belong to you." />
    )
  }

  const activeStepIndex = Math.max(
    0,
    NEXT_STEPS.findIndex((s) => s.id === order.order_status)
  )

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="text-center mb-2 animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success-500" strokeWidth={1.75} />
        </div>
        <h1 className="heading-page">Order placed, thank you!</h1>
        <p className="text-body-sm mt-1.5">A confirmation has been sent to your email.</p>
      </div>

      <div
        className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-6 space-y-5 animate-fade-in-up"
        style={{ animationDelay: '80ms' }}
      >
        <div className="grid grid-cols-2 gap-5 text-sm">
          <div>
            <div className="text-label mb-1">Order number</div>
            <div className="font-medium text-charcoal-900 break-all">{order.id}</div>
          </div>
          <div>
            <div className="text-label mb-1">Order total</div>
            <div className="font-medium text-charcoal-900">{formatPrice(order.total)}</div>
          </div>
          <div>
            <div className="text-label mb-1">Payment method</div>
            <div className="font-medium text-charcoal-900 capitalize">
              {order.payment_method?.replace(/_/g, ' ')}
            </div>
          </div>
          <div>
            <div className="text-label mb-1">Status</div>
            <OrderStatusBadge status={order.order_status} />
          </div>
        </div>

        {order.addresses && (
          <div className="border-t border-stone-200 pt-5 text-sm">
            <div className="font-medium text-charcoal-900 mb-1">Shipping to</div>
            <div className="text-charcoal-600">
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

        <div className="border-t border-stone-200 pt-5">
          <div className="text-label mb-3">What's next</div>
          <ol className="flex items-center">
            {NEXT_STEPS.map((s, i) => {
              const done = i <= activeStepIndex
              const current = i === activeStepIndex
              const Icon = s.icon
              return (
                <li key={s.id} className="flex-1 flex items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <span
                      className={
                        'flex items-center justify-center w-8 h-8 rounded-full transition-avenzo ' +
                        (current
                          ? 'bg-brass-400 text-charcoal-900'
                          : done
                            ? 'bg-charcoal-900 text-bone-50'
                            : 'bg-stone-100 text-charcoal-400')
                      }
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className={'text-caption ' + (done ? 'text-charcoal-700' : '')}>
                      {s.label}
                    </span>
                  </div>
                  {i < NEXT_STEPS.length - 1 && (
                    <span
                      className={
                        'h-0.5 flex-1 mx-2 -translate-y-3 rounded-full transition-avenzo ' +
                        (i < activeStepIndex ? 'bg-brass-400' : 'bg-stone-200')
                      }
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </div>

        <div className="border-t border-stone-200 pt-5">
          <div className="font-medium text-charcoal-900 mb-2 text-sm">Items</div>
          <ul className="divide-y divide-stone-200 text-sm">
            {order.order_items?.map((it) => (
              <li key={it.id} className="py-2.5 flex items-center gap-3">
                {it.product_image && (
                  <img
                    src={it.product_image}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    to={'/products/' + it.product_id}
                    className="text-charcoal-900 hover:text-brass-700 transition-avenzo line-clamp-1"
                  >
                    {it.product_title}
                  </Link>
                  <div className="text-caption">Qty: {it.quantity}</div>
                </div>
                <div className="font-medium text-charcoal-900">
                  {formatPrice(Number(it.price) * it.quantity)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-stone-200 pt-5 flex gap-3 flex-wrap">
          <Button variant="secondary" onClick={() => navigate('/orders/' + order.id)}>
            Track your order
          </Button>
          <Button variant="outline" onClick={() => navigate('/products')}>
            Continue shopping
          </Button>
          {order.registry_id && (
            <Button variant="outline" onClick={() => navigate(`/registry/${order.registry_id}`)}>
              View registry
            </Button>
          )}
        </div>
      </div>

      {giftCards.length > 0 && (
        <section
          className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-6 space-y-4 animate-fade-in-up"
          style={{ animationDelay: '160ms' }}
        >
          <h2 className="heading-sub flex items-center gap-2">
            <Gift className="w-5 h-5 text-brass-600" /> Your Gift Cards
          </h2>
          <p className="text-body-sm">
            {giftCards.length === 1
              ? 'Your gift card has been issued. Share the claim code with the recipient.'
              : 'Your gift cards have been issued. Share each claim code with its recipient.'}
          </p>
          <div className="space-y-4">
            {giftCards.map((gc) => (
              <div
                key={gc.id}
                className="border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-label mb-1">
                    {gc.delivery_method === 'email'
                      ? 'Email gift card'
                      : gc.delivery_method === 'print'
                      ? 'Print at home'
                      : 'Physical gift card'}
                  </div>
                  <div className="text-price-lg">{formatPrice(gc.amount)}</div>
                  <div className="text-body-sm mt-1">
                    <strong className="text-charcoal-700">To:</strong> {gc.recipient_name}
                    {gc.recipient_email ? ` · ${gc.recipient_email}` : ''}
                  </div>
                  {gc.message && (
                    <div className="text-caption mt-1 italic">"{gc.message}"</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-label mb-1">Claim code</div>
                  <div className="flex items-center gap-2">
                    <code className="text-base font-mono font-bold bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5">
                      {gc.code}
                    </code>
                    <button
                      onClick={() => navigator.clipboard?.writeText(gc.code)}
                      className="p-2 rounded-lg border border-stone-300 hover:bg-stone-100 transition-avenzo"
                      title="Copy claim code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-caption mt-2">
                    Recipient redeems at <span className="font-mono">/gift-cards/redeem</span>
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
