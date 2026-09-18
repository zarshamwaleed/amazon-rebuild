import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrderById } from '../services/orderService'
import EmptyState from '../components/EmptyState'
import OrderStatusBadge from '../components/OrderStatusBadge'
import OrderStatusTimeline from '../components/OrderStatusTimeline'
import { MessageCircle, RotateCcw, X } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { sendCustomerMessage } from '../services/messageService'
import {
  createReturnRequest,
  getActiveReturnsForOrder,
} from '../services/customerReturnService'
import { supabase } from '../services/supabase'

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
                      className="text-xs text-[#007185] hover:underline flex items-center gap-1 mt-1"
                    >
                      <MessageCircle className="w-3 h-3" /> Contact seller
                    </button>
                    {returnsByProduct[it.product_id] ? (
                      <ReturnStatusLine ret={returnsByProduct[it.product_id]} />
                    ) : (
                      <button
                        onClick={() => handleOpenReturn(it)}
                        className="text-xs text-[#007185] hover:underline mt-1 inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Return this item
                      </button>
                    )}
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
    </div>
  )
}

const RETURN_STATUS_META = {
  requested: {
    label: 'Return Requested',
    hint: 'Waiting for seller to review.',
    cls: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  pending_authorization: {
    label: 'Return Requested',
    hint: 'Pending seller authorization.',
    cls: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  authorized: {
    label: 'Return Authorized',
    hint: 'Ship the item back with the provided label.',
    cls: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  return_in_transit: {
    label: 'Return In Transit',
    hint: 'The seller is waiting for the item to arrive.',
    cls: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  return_received: {
    label: 'Return Received',
    hint: 'The seller has your item.',
    cls: 'text-cyan-700',
    dot: 'bg-cyan-500',
  },
  refund_pending: {
    label: 'Refund Pending',
    hint: 'Your refund is being processed.',
    cls: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  refunded: {
    label: 'Refunded',
    hint: 'Your refund has been issued.',
    cls: 'text-green-700',
    dot: 'bg-green-500',
  },
  declined: {
    label: 'Return Declined',
    hint: 'The seller declined this return.',
    cls: 'text-red-700',
    dot: 'bg-red-500',
  },
  completed: {
    label: 'Return Completed',
    hint: 'This return is closed.',
    cls: 'text-green-700',
    dot: 'bg-green-500',
  },
}

function ReturnStatusLine({ ret }) {
  const meta = RETURN_STATUS_META[ret.status] || RETURN_STATUS_META.requested
  return (
    <div className="mt-1.5 space-y-0.5">
      <div
        className={
          'text-xs font-medium inline-flex items-center gap-1.5 ' + meta.cls
        }
      >
        <span className={'w-1.5 h-1.5 rounded-full ' + meta.dot} />
        <RotateCcw className="w-3 h-3" />
        {meta.label}
        {ret.rma && (
          <span className="text-[10px] text-gray-500 font-mono ml-1">
            {ret.rma}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 pl-4">{meta.hint}</div>
      <Link
        to="/returns"
        className="text-xs text-[#007185] hover:underline pl-4 inline-block"
      >
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
  const [subject, setSubject] = useState(
    `Question about ${productTitle || 'your order'}`
  )
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Contact seller</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600">
            Sending about: <strong>{productTitle}</strong>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Message
            </label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi, I have a question about my order…"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded disabled:opacity-60 transition"
            >
              {sending ? 'Sending…' : 'Send message'}
            </button>
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

function CustomerReturnModal({
  item,
  order,
  customerName,
  customerEmail,
  onClose,
  onCreated,
}) {
  const { pushToast } = useToast()
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Request a return</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Item preview */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded p-3">
            {item.product_image && (
              <img
                src={item.product_image}
                alt=""
                className="w-12 h-12 rounded object-cover border"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {item.product_title}
              </div>
              <div className="text-xs text-gray-500">
                Qty {item.quantity} · ${Number(item.price).toFixed(2)} each
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Why are you returning this?
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {RETURN_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Add a comment (optional)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the issue in more detail…"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded p-3">
            The seller will review your request. You'll be notified once it's
            authorized. Return shipping is free for eligible items.
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm disabled:opacity-60 transition"
            >
              {sending ? 'Submitting…' : 'Submit return request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}