import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrderById } from '../services/orderService'
import EmptyState from '../components/EmptyState'
import OrderStatusBadge from '../components/OrderStatusBadge'
import OrderStatusTimeline from '../components/OrderStatusTimeline'
import Button from '../components/Button'
import Input from '../components/Input'
import Badge from '../components/Badge'
import { PAYMENT_OPTIONS } from '../components/PaymentSelector'
import { MessageCircle, RotateCcw, Star, Check, X } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { sendCustomerMessage } from '../services/messageService'
import {
  createReturnRequest,
  getActiveReturnsForOrder,
} from '../services/customerReturnService'
import { getReviewedProductIds } from '../services/reviewService'
import WriteReviewModal from '../components/WriteReviewModal'
import { supabase } from '../services/supabase'
import { formatPrice } from '../lib/utils'

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
  const { user, profile } = useAuth()
  const { pushToast } = useToast()
  const [order, setOrder] = useState(null)
  const [showContact, setShowContact] = useState(false)
  const [contactSeller, setContactSeller] = useState(null) // { sellerId, productTitle }
  const [returnItem, setReturnItem] = useState(null)
  const [returnsByProduct, setReturnsByProduct] = useState({})
  const [reviewItem, setReviewItem] = useState(null)
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set())
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

  // Check which items already have active returns
  useEffect(() => {
    if (!order?.order_items || !user?.email) return
    let cancelled = false
    async function check() {
      const map = await getActiveReturnsForOrder(user.email, order.id)
      if (!cancelled) setReturnsByProduct(map)
    }
    check()
    return () => {
      cancelled = true
    }
  }, [order, user])

  // Check which items the user has already reviewed
  useEffect(() => {
    if (!order?.order_items || !user?.id) return
    let cancelled = false
    async function check() {
      const productIds = order.order_items.map((it) => it.product_id).filter(Boolean)
      const ids = await getReviewedProductIds(user.id, productIds)
      if (!cancelled) setReviewedProductIds(ids)
    }
    check()
    return () => {
      cancelled = true
    }
  }, [order, user])

  async function handleOpenReturn(item) {
    // Look up the seller for this product
    const { data: prod } = await supabase
      .from('products')
      .select('seller_id, sku')
      .eq('id', item.product_id)
      .maybeSingle()

    if (!prod?.seller_id) {
      pushToast('This product has no seller to return to', { type: 'info' })
      return
    }

    setReturnItem({
      ...item,
      seller_id: prod.seller_id,
      sku: prod.sku,
    })
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton-shimmer h-4 w-32 rounded-md mb-4" />
        <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
          <div className="skeleton-shimmer h-7 w-40 rounded-md" />
          <div className="skeleton-shimmer h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-bone-50 border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
              <div className="skeleton-shimmer h-16 rounded-lg" />
              <div className="skeleton-shimmer h-16 rounded-lg" />
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-bone-50 border border-stone-200 rounded-xl p-5 sm:p-6 space-y-3">
              <div className="skeleton-shimmer h-4 w-2/3 rounded-md" />
              <div className="skeleton-shimmer h-4 w-full rounded-md" />
              <div className="skeleton-shimmer h-4 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    )
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
      <nav className="text-caption mb-4">
        <Link to="/orders" className="hover:text-charcoal-800 hover:underline">
          Your Orders
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-charcoal-700">Order {order.id.split('-')[0]}</span>
      </nav>

      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
        <h1 className="heading-page">Order Details</h1>
        <OrderStatusBadge status={order.order_status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: items + address */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-bone-50 border border-stone-200 rounded-xl p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4 text-sm mb-5 pb-5 border-b border-stone-200">
              <div>
                <div className="text-label">Order placed</div>
                <div className="text-charcoal-900 font-medium mt-1">
                  {formatDate(order.created_at, true)}
                </div>
              </div>
              <div>
                <div className="text-label">Order number</div>
                <div className="text-charcoal-900 font-mono break-all text-xs mt-1">
                  {order.id}
                </div>
              </div>
            </div>

            <h2 className="heading-sub mb-4">Items ({itemCount})</h2>
            <ul className="divide-y divide-stone-100">
              {items.map((it) => (
                <li key={it.id} className="py-4 first:pt-0 flex items-center gap-4">
                  {it.product_image && (
                    <img
                      src={it.product_image}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg border border-stone-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={'/products/' + it.product_id}
                      className="text-sm text-charcoal-900 hover:text-brass-600 line-clamp-2"
                    >
                      {it.product_title}
                    </Link>
                    <div className="text-caption mt-1">Qty: {it.quantity}</div>
                    <button
                      onClick={async () => {
                        // Look up the seller for this product
                        const { data: prod } = await supabase
                          .from('products')
                          .select('seller_id')
                          .eq('id', it.product_id)
                          .maybeSingle()
                        if (!prod?.seller_id) {
                          pushToast('This product has no seller to contact', { type: 'info' })
                          return
                        }
                        setContactSeller({ sellerId: prod.seller_id, productTitle: it.product_title })
                        setShowContact(true)
                      }}
                      className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1.5 mt-1.5 transition-avenzo"
                    >
                      <MessageCircle className="w-3 h-3" /> Contact seller
                    </button>
                    {returnsByProduct[it.product_id] ? (
                      <ReturnStatusLine ret={returnsByProduct[it.product_id]} />
                    ) : (
                      <button
                        onClick={() => handleOpenReturn(it)}
                        className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 mt-1.5 inline-flex items-center gap-1.5 transition-avenzo"
                      >
                        <RotateCcw className="w-3 h-3" /> Return this item
                      </button>
                    )}
                    {it.product_id &&
                      (reviewedProductIds.has(it.product_id) ? (
                        <span className="text-xs font-medium text-success-700 inline-flex items-center gap-1.5 mt-1.5">
                          <Check className="w-3 h-3" /> Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => setReviewItem(it)}
                          className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 mt-1.5 inline-flex items-center gap-1.5 transition-avenzo"
                        >
                          <Star className="w-3 h-3" /> Write a review
                        </button>
                      ))}
                  </div>
                  <div className="text-sm font-medium text-charcoal-900">
                    {formatPrice(Number(it.price) * it.quantity)}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-bone-50 border border-stone-200 rounded-xl p-5 sm:p-6">
            <h2 className="heading-sub mb-4">Shipping address</h2>
            {order.addresses ? (
              <div className="text-sm text-charcoal-700 leading-relaxed">
                <div className="font-medium text-charcoal-900">{order.addresses.full_name}</div>
                <div>{order.addresses.address_line}</div>
                <div>
                  {order.addresses.city}
                  {order.addresses.postal_code ? ', ' + order.addresses.postal_code : ''}
                </div>
                <div>{order.addresses.country}</div>
                {order.addresses.phone && (
                  <div className="text-caption mt-1.5">{order.addresses.phone}</div>
                )}
              </div>
            ) : (
              <p className="text-body-sm">No address on file.</p>
            )}
          </section>
        </div>

        {/* Right: timeline + summary */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-bone-50 border border-stone-200 rounded-xl p-5 sm:p-6">
            <h2 className="heading-sub mb-5">Order status</h2>
            <OrderStatusTimeline status={order.order_status} />
          </section>

          <section className="bg-bone-50 border border-stone-200 rounded-xl p-5 sm:p-6">
            <h2 className="heading-sub mb-4">Order summary</h2>
            <dl className="text-sm space-y-2.5">
              <div className="flex justify-between text-charcoal-700">
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-charcoal-700">
                <dt>Shipping</dt>
                <dd>{Number(order.shipping_fee) === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</dd>
              </div>
              <div className="flex justify-between text-charcoal-700">
                <dt>Tax</dt>
                <dd>{formatPrice(order.tax)}</dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-stone-200 text-base font-semibold text-charcoal-900">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
              <div className="flex justify-between text-charcoal-700 pt-3 border-t border-stone-200">
                <dt>Payment</dt>
                <dd>
                  {PAYMENT_OPTIONS.find((o) => o.id === order.payment_method)?.label ||
                    (order.payment_method || 'N/A').replace(/_/g, ' ')}
                </dd>
              </div>
              <div className="flex justify-between items-center text-charcoal-700">
                <dt>Payment status</dt>
                <dd>
                  <Badge color={order.payment_status === 'paid' ? 'green' : 'gray'} className="capitalize">
                    {order.payment_status || 'Unknown'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </section>

          <Link to="/products">
            <Button variant="secondary" size="lg" className="w-full">
              Continue shopping
            </Button>
          </Link>
        </div>
      </div>

      {showContact && contactSeller && (
        <ContactSellerModal
          sellerId={contactSeller.sellerId}
          orderId={order.id}
          productTitle={contactSeller.productTitle}
          customerName={profile?.full_name || 'Customer'}
          customerEmail={profile?.email || user?.email}
          onClose={() => setShowContact(false)}
        />
      )}

      {returnItem && (
        <CustomerReturnModal
          item={returnItem}
          order={order}
          customerName={profile?.full_name || 'Customer'}
          customerEmail={user?.email}
          onClose={() => setReturnItem(null)}
          onCreated={async () => {
            // Refresh the returns map so the row immediately shows the new status
            const fresh = await getActiveReturnsForOrder(user.email, order.id)
            setReturnsByProduct(fresh)
            setReturnItem(null)
            pushToast('Return request sent to seller', { type: 'success' })
          }}
        />
      )}

      {reviewItem && (
        <WriteReviewModal
          product={{
            id: reviewItem.product_id,
            title: reviewItem.product_title,
            image_url: reviewItem.product_image,
          }}
          onClose={() => setReviewItem(null)}
          onSubmitted={() => {
            setReviewedProductIds((prev) => new Set(prev).add(reviewItem.product_id))
            setReviewItem(null)
          }}
        />
      )}
    </div>
  )
}

const RETURN_STATUS_META = {
  requested: {
    label: 'Return Requested',
    hint: 'Waiting for seller to review.',
    cls: 'text-warning-700',
    dot: 'bg-warning-500',
  },
  pending_authorization: {
    label: 'Return Requested',
    hint: 'Pending seller authorization.',
    cls: 'text-warning-700',
    dot: 'bg-warning-500',
  },
  authorized: {
    label: 'Return Authorized',
    hint: 'Ship the item back with the provided label.',
    cls: 'text-info-700',
    dot: 'bg-info-500',
  },
  return_in_transit: {
    label: 'Return In Transit',
    hint: 'The seller is waiting for the item to arrive.',
    cls: 'text-info-700',
    dot: 'bg-info-500',
  },
  return_received: {
    label: 'Return Received',
    hint: 'The seller has your item.',
    cls: 'text-info-700',
    dot: 'bg-info-500',
  },
  refund_pending: {
    label: 'Refund Pending',
    hint: 'Your refund is being processed.',
    cls: 'text-warning-700',
    dot: 'bg-warning-500',
  },
  refunded: {
    label: 'Refunded',
    hint: 'Your refund has been issued.',
    cls: 'text-success-700',
    dot: 'bg-success-500',
  },
  declined: {
    label: 'Return Declined',
    hint: 'The seller declined this return.',
    cls: 'text-error-700',
    dot: 'bg-error-500',
  },
  completed: {
    label: 'Return Completed',
    hint: 'This return is closed.',
    cls: 'text-success-700',
    dot: 'bg-success-500',
  },
}

function ReturnStatusLine({ ret }) {
  const meta = RETURN_STATUS_META[ret.status] || RETURN_STATUS_META.requested
  return (
    <div className="mt-2 space-y-0.5">
      <div className={'text-xs font-medium inline-flex items-center gap-1.5 ' + meta.cls}>
        <span className={'w-1.5 h-1.5 rounded-full ' + meta.dot} />
        <RotateCcw className="w-3 h-3" />
        {meta.label}
        {ret.rma && (
          <span className="text-[10px] text-charcoal-500 font-mono ml-1">{ret.rma}</span>
        )}
      </div>
      <div className="text-caption pl-4">{meta.hint}</div>
      <Link to="/returns" className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 pl-4 inline-block">
        View return details →
      </Link>
    </div>
  )
}

function ContactSellerModal({
  sellerId,
  orderId,
  productTitle,
  customerName,
  customerEmail,
  onClose,
}) {
  const { pushToast } = useToast()
  const [subject, setSubject] = useState(`Question about ${productTitle || 'your order'}`)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return setError('Write a message before sending')
    setSending(true)
    setError(null)
    try {
      await sendCustomerMessage({
        sellerId,
        orderId,
        customerName,
        customerEmail,
        subject: subject.trim(),
        body: body.trim(),
      })
      pushToast('Message sent to seller', { type: 'success' })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-xl shadow-lifted w-full max-w-lg reveal-modal">
        <div className="border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <h2 className="heading-sub">Contact seller</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-md transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-charcoal-600">
            Sending about: <strong className="text-charcoal-800">{productTitle}</strong>
          </div>

          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />

          <div>
            <label className="block text-label mb-1.5">Message</label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi, I have a question about my order…"
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 resize-none transition-avenzo focus:outline-none focus:border-brass-400"
            />
          </div>

          {error && (
            <div className="text-sm text-error-700 bg-error-50 border border-error-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={sending}>
              {sending ? 'Sending…' : 'Send message'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const RETURN_REASONS = [
  'Item defective',
  'Item damaged',
  'Wrong item received',
  'Changed my mind',
  "Item doesn't match description",
  'Missing parts',
  'Wrong size',
  'Arrived too late',
  'Ordered by mistake',
  'Other',
]

function CustomerReturnModal({ item, order, customerName, customerEmail, onClose, onCreated }) {
  const [reason, setReason] = useState(RETURN_REASONS[0])
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim() && reason === 'Other') {
      return setError('Please add a comment explaining your reason.')
    }
    setSending(true)
    setError(null)
    try {
      await createReturnRequest({
        productId: item.product_id,
        orderId: order.id,
        sellerId: item.seller_id,
        customerName,
        customerEmail,
        productTitle: item.product_title,
        productSku: item.sku,
        productImage: item.product_image,
        orderTotal: order.total,
        reason,
        comment: comment.trim(),
      })
      onCreated()
    } catch (err) {
      setError(err.message || 'Could not submit return request')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-xl shadow-lifted w-full max-w-lg max-h-[90vh] overflow-y-auto reveal-modal">
        <div className="sticky top-0 bg-bone-50 border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <h2 className="heading-sub">Request a return</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-md transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Item preview */}
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-lg p-3">
            {item.product_image && (
              <img
                src={item.product_image}
                alt=""
                className="w-12 h-12 rounded-md object-cover border border-stone-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-charcoal-900 truncate">
                {item.product_title}
              </div>
              <div className="text-caption">
                Qty {item.quantity} · {formatPrice(item.price)} each
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-label mb-1.5">Why are you returning this?</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 transition-avenzo focus:outline-none focus:border-brass-400"
            >
              {RETURN_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-label mb-1.5">Add a comment (optional)</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the issue in more detail…"
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 resize-none transition-avenzo focus:outline-none focus:border-brass-400"
            />
          </div>

          <div className="bg-info-50 border border-info-500/20 text-info-700 text-xs rounded-lg p-3">
            The seller will review your request. You'll be notified once it's authorized. Return
            shipping is free for eligible items.
          </div>

          {error && (
            <div className="text-sm text-error-700 bg-error-50 border border-error-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={sending}>
              {sending ? 'Submitting…' : 'Submit return request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
