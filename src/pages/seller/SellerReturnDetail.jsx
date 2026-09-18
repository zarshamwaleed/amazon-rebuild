import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  User,
  Truck,
  DollarSign,
  RotateCcw,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  MapPin,
  FileText,
  ClipboardCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerReturn,
  authorizeReturn,
  declineReturn,
  markReturnShipped,
  receiveReturn,
  issueRefund,
  getReturnMessages,
  sendReturnMessage,
  returnTimelineIndex,
} from '../../services/sellerService'

const STATUS_META = {
  requested: { label: 'Requested', cls: 'bg-blue-100 text-blue-800' },
  pending_authorization: { label: 'Pending Authorization', cls: 'bg-amber-100 text-amber-800' },
  authorized: { label: 'Authorized', cls: 'bg-blue-100 text-blue-800' },
  return_in_transit: { label: 'Return In Transit', cls: 'bg-indigo-100 text-indigo-800' },
  return_received: { label: 'Return Received', cls: 'bg-cyan-100 text-cyan-800' },
  refund_pending: { label: 'Refund Pending', cls: 'bg-amber-100 text-amber-800' },
  refunded: { label: 'Refunded', cls: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', cls: 'bg-red-100 text-red-800' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-800' },
}

const TIMELINE_STEPS = [
  { key: 'requested', label: 'Return Requested' },
  { key: 'pending_authorization', label: 'Request Reviewed' },
  { key: 'authorized', label: 'Return Authorized' },
  { key: 'return_in_transit', label: 'Return Shipped' },
  { key: 'return_received', label: 'Return Received' },
  { key: 'refund_pending', label: 'Refund Pending' },
  { key: 'refunded', label: 'Refund Issued' },
]

const DECLINE_REASONS = [
  'Outside return window',
  'Item not eligible for return',
  'Customer already refunded',
  'Return policy violation',
  'Missing proof of purchase',
  'Other',
]

const CONDITIONS = [
  { id: 'new', label: 'New / unopened' },
  { id: 'used', label: 'Used' },
  { id: 'damaged', label: 'Damaged' },
  { id: 'defective', label: 'Defective' },
  { id: 'missing_parts', label: 'Missing parts' },
  { id: 'wrong_item', label: 'Wrong item' },
]

export default function SellerReturnDetail() {
  const { returnId } = useParams()
  const { user } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [ret, setRet] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const [showAuthorize, setShowAuthorize] = useState(false)
  const [showDecline, setShowDecline] = useState(false)
  const [showReceive, setShowReceive] = useState(false)
  const [showRefund, setShowRefund] = useState(false)
  const [busy, setBusy] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  async function load() {
    if (!user || !returnId) return
    try {
      setLoading(true)
      const [r, msgs] = await Promise.all([
        getSellerReturn(user.id, returnId),
        getReturnMessages(user.id, returnId),
      ])
      setRet(r)
      setMessages(msgs)
    } catch (err) {
      pushToast('Could not load return', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user, returnId])

  const currentStep = useMemo(
    () => (ret ? returnTimelineIndex(ret.status) : 0),
    [ret]
  )

  async function handleAuthorize(payload) {
    setBusy(true)
    try {
      await authorizeReturn(user.id, ret.id, payload)
      pushToast('Return authorized', { type: 'success' })
      setShowAuthorize(false)
      await load()
    } catch (err) {
      pushToast('Could not authorize', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function handleDecline(reason, notes) {
    setBusy(true)
    try {
      await declineReturn(user.id, ret.id, reason, notes)
      pushToast('Return declined', { type: 'info' })
      setShowDecline(false)
      await load()
    } catch (err) {
      pushToast('Could not decline', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function handleMarkShipped() {
    setBusy(true)
    try {
      await markReturnShipped(user.id, ret.id)
      pushToast('Marked as in transit', { type: 'success' })
      await load()
    } catch (err) {
      pushToast('Could not update', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function handleReceive(payload) {
    setBusy(true)
    try {
      await receiveReturn(user.id, ret.id, payload)
      pushToast('Return received', { type: 'success' })
      setShowReceive(false)
      await load()
    } catch (err) {
      pushToast('Could not record receipt', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function handleRefund(payload) {
    setBusy(true)
    try {
      await issueRefund(user.id, ret.id, payload)
      pushToast('Refund issued', { type: 'success' })
      setShowRefund(false)
      await load()
    } catch (err) {
      pushToast('Could not issue refund', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return
    setBusy(true)
    try {
      await sendReturnMessage(user.id, ret.id, newMessage.trim())
      setNewMessage('')
      const msgs = await getReturnMessages(user.id, ret.id)
      setMessages(msgs)
    } catch (err) {
      pushToast('Could not send message', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading return…</div>
  }

  if (!ret) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <RotateCcw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">Return not found</h3>
        <p className="text-sm text-gray-600 mb-4">
          This return doesn't exist or doesn't belong to you.
        </p>
        <Link
          to="/seller/orders/returns"
          className="text-[#007185] hover:underline text-sm"
        >
          ← Back to returns
        </Link>
      </div>
    )
  }

  const status = STATUS_META[ret.status] || STATUS_META.requested
  const needsAction =
    ret.status === 'requested' || ret.status === 'pending_authorization'
  const canShip = ret.status === 'authorized'
  const canReceive = ret.status === 'return_in_transit'
  const canRefund = ret.status === 'refund_pending'
  const refunded = ret.status === 'refunded'

  return (
    <div className="space-y-5 max-w-5xl pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/seller/orders/returns"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500">Return</div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">
            {ret.rma || ret.id.slice(0, 8)}
          </h1>
        </div>
        <span
          className={
            'text-sm font-medium px-3 py-1 rounded-full ' + status.cls
          }
        >
          {status.label}
        </span>
      </div>

      {/* Timeline */}
      {ret.status !== 'declined' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-gray-900 mb-4">Return Timeline</h2>
          <ol className="flex items-start gap-1 overflow-x-auto no-scrollbar pb-2">
            {TIMELINE_STEPS.map((step, i) => {
              const done = i < currentStep
              const active = i === currentStep
              return (
                <li key={step.key} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-2 min-w-[110px]">
                    <div
                      className={
                        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition ' +
                        (done
                          ? 'bg-green-600 border-green-600 text-white'
                          : active
                          ? 'bg-[#febd69] border-[#febd69] text-gray-900'
                          : 'bg-white border-gray-300 text-gray-400')
                      }
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                      className={
                        'text-xs text-center leading-tight ' +
                        (active
                          ? 'font-bold text-[#c7511f]'
                          : done
                          ? 'text-gray-900'
                          : 'text-gray-500')
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={
                        'h-0.5 w-8 -mt-5 ' +
                        (i < currentStep ? 'bg-green-600' : 'bg-gray-200')
                      }
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {ret.status === 'declined' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-900">This return was declined</div>
            {ret.seller_notes && (
              <div className="text-sm text-red-800 mt-1">{ret.seller_notes}</div>
            )}
          </div>
        </div>
      )}

      {/* Action bar */}
      {needsAction && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900">This return requires your attention</div>
              <div className="text-sm text-amber-800 mt-0.5">
                Customer reason: <strong>{ret.return_reason}</strong>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDecline(true)}
              className="border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded text-sm font-medium"
            >
              Decline
            </button>
            <button
              onClick={() => setShowAuthorize(true)}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm"
            >
              Authorize Return
            </button>
          </div>
        </div>
      )}

      {canShip && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-blue-900">Waiting for the customer to ship</div>
              <div className="text-sm text-blue-800 mt-0.5">
                Tracking: <span className="font-mono">{ret.tracking_number}</span> · {ret.carrier}
              </div>
            </div>
          </div>
          <button
            onClick={handleMarkShipped}
            disabled={busy}
            className="bg-white border border-blue-300 text-blue-800 hover:bg-blue-50 px-4 py-2 rounded text-sm font-medium disabled:opacity-60"
          >
            Mark as Shipped
          </button>
        </div>
      )}

      {canReceive && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-cyan-900">Return in transit</div>
              <div className="text-sm text-cyan-800 mt-0.5">
                Once you physically receive the item, record its condition.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowReceive(true)}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm"
          >
            Record Receipt
          </button>
        </div>
      )}

      {canRefund && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-green-900">Return received — refund pending</div>
              <div className="text-sm text-green-800 mt-0.5">
                Item condition: <strong className="capitalize">{ret.condition || 'used'}</strong>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowRefund(true)}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm"
          >
            Issue Refund
          </button>
        </div>
      )}

      {refunded && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-bold text-green-900">Refund completed</div>
            <div className="text-sm text-green-800">
              ${Number(ret.refund_amount).toFixed(2)} refunded on{' '}
              {ret.refunded_at && new Date(ret.refunded_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Product */}
          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" /> Product
            </h2>
            <div className="flex gap-4">
              {ret.product_image ? (
                <img
                  src={ret.product_image}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100" />
              )}
              <div className="min-w-0">
                <div className="font-medium text-gray-900">{ret.product_title}</div>
                {ret.product_sku && (
                  <div className="text-xs text-gray-500 font-mono mt-0.5">
                    SKU: {ret.product_sku}
                  </div>
                )}
                <div className="text-sm text-gray-700 mt-2">
                  Order Total:{' '}
                  <strong>${Number(ret.order_total || 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Customer + Order */}
          <div className="grid md:grid-cols-2 gap-5">
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Customer
              </h2>
              <div className="text-sm text-gray-700">
                <div className="font-medium text-gray-900">{ret.customer_name}</div>
                {ret.customer_email && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {ret.customer_email}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Order
              </h2>
              <div className="text-sm text-gray-700">
                <div className="font-mono text-xs text-gray-600">
                  {ret.order_id ? ret.order_id.slice(0, 8) : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Requested {new Date(ret.requested_at).toLocaleDateString()}
                </div>
                {ret.order_id && (
                  <Link
                    to={`/seller/orders/${ret.order_id}`}
                    className="text-[#007185] hover:underline text-xs mt-2 inline-block"
                  >
                    View order →
                  </Link>
                )}
              </div>
            </section>
          </div>

          {/* Return reason */}
          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" /> Return Reason
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Customer reason
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {ret.return_reason}
                </div>
              </div>
              {ret.customer_comment && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Customer comment
                  </div>
                  <div className="text-sm text-gray-700 italic bg-gray-50 border border-gray-200 rounded p-3">
                    "{ret.customer_comment}"
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Messages */}
          <section className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-3 border-b flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <h2 className="font-bold text-gray-900">Customer Messages</h2>
            </div>
            <div className="px-5 py-4 max-h-72 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No messages yet. Start the conversation below.
                </p>
              ) : (
                messages.map((m) => {
                  const outbound = m.direction === 'outbound'
                  return (
                    <div
                      key={m.id}
                      className={'flex ' + (outbound ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={
                          'max-w-[75%] rounded-lg px-3 py-2 text-sm ' +
                          (outbound
                            ? 'bg-[#232f3e] text-white'
                            : 'bg-gray-100 text-gray-800')
                        }
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {outbound ? 'You' : m.author || ret.customer_name} ·{' '}
                          {new Date(m.created_at).toLocaleString()}
                        </div>
                        {m.body}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send a message to the customer…"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="submit"
                  disabled={busy || !newMessage.trim()}
                  className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-1.5 text-sm disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Right: shipping + refund summary */}
        <div className="space-y-5">
          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Return Shipping
            </h2>
            {ret.tracking_number ? (
              <dl className="text-sm space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Carrier</dt>
                  <dd className="text-gray-900">{ret.carrier}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Tracking</dt>
                  <dd className="text-gray-900 font-mono text-xs">
                    {ret.tracking_number}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Method</dt>
                  <dd className="text-gray-900 capitalize">
                    {(ret.return_method || 'prepaid_label').replace(/_/g, ' ')}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-500">
                Not authorized yet. Tracking will be generated on authorization.
              </p>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Refund
            </h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Order total</dt>
                <dd className="text-gray-900">
                  ${Number(ret.order_total || 0).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Restocking fee</dt>
                <dd className="text-gray-900">
                  {Number(ret.restocking_fee) > 0
                    ? '-$' + Number(ret.restocking_fee).toFixed(2)
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-gray-900">
                <dt>Refunded</dt>
                <dd>
                  {Number(ret.refund_amount) > 0
                    ? '$' + Number(ret.refund_amount).toFixed(2)
                    : '—'}
                </dd>
              </div>
            </dl>
          </section>

          {ret.seller_notes && (
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Seller Notes
              </h2>
              <p className="text-sm text-gray-700">{ret.seller_notes}</p>
            </section>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAuthorize && (
        <AuthorizeModal
          ret={ret}
          onClose={() => setShowAuthorize(false)}
          onSubmit={handleAuthorize}
          busy={busy}
        />
      )}
      {showDecline && (
        <DeclineModal
          onClose={() => setShowDecline(false)}
          onSubmit={handleDecline}
          busy={busy}
        />
      )}
      {showReceive && (
        <ReceiveModal
          onClose={() => setShowReceive(false)}
          onSubmit={handleReceive}
          busy={busy}
        />
      )}
      {showRefund && (
        <RefundModal
          ret={ret}
          onClose={() => setShowRefund(false)}
          onSubmit={handleRefund}
          busy={busy}
        />
      )}
    </div>
  )
}

/* ============================================================
   Modals
   ============================================================ */

function ModalShell({ title, onClose, children, icon: Icon }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-gray-600" />}
            <h2 className="font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AuthorizeModal({ ret, onClose, onSubmit, busy }) {
  const [method, setMethod] = useState('prepaid_label')
  const [carrier, setCarrier] = useState('UPS')
  const [address, setAddress] = useState(
    'Returns Dept · 123 Warehouse Rd · Karachi · 75500 · Pakistan'
  )

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ return_method: method, carrier, return_address: address })
  }

  return (
    <ModalShell title="Authorize Return" onClose={onClose} icon={Truck}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600">
          RMA <strong>{ret.rma}</strong> will be sent to the customer, along with
          a prepaid return label.
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Return method
          </label>
          <div className="space-y-2">
            {[
              { id: 'prepaid_label', label: 'Amazon prepaid label' },
              { id: 'seller_label', label: 'Seller-provided label' },
            ].map((m) => (
              <label
                key={m.id}
                className={
                  'flex items-center gap-2 p-3 rounded border cursor-pointer text-sm ' +
                  (method === m.id
                    ? 'border-[#c7511f] bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400')
                }
              >
                <input
                  type="radio"
                  name="method"
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Carrier
          </label>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option>UPS</option>
            <option>USPS</option>
            <option>FedEx</option>
            <option>DHL</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Seller return address
          </label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

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
            disabled={busy}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm disabled:opacity-60"
          >
            {busy ? 'Authorizing…' : 'Authorize Return'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function DeclineModal({ onClose, onSubmit, busy }) {
  const [reason, setReason] = useState(DECLINE_REASONS[0])
  const [notes, setNotes] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(reason, notes)
  }

  return (
    <ModalShell title="Decline Return" onClose={onClose} icon={XCircle}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-900 text-xs rounded p-3">
          Declining a return is subject to your return policy. The customer will
          be notified and can appeal through Amazon Rebuild support.
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Reason for declining
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {DECLINE_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Additional information
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain your decision to the customer…"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

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
            disabled={busy}
            className="bg-red-600 hover:bg-red-500 text-white font-medium px-5 py-2 rounded text-sm disabled:opacity-60"
          >
            {busy ? 'Declining…' : 'Decline Request'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function ReceiveModal({ onClose, onSubmit, busy }) {
  const [condition, setCondition] = useState('used')
  const [notes, setNotes] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ condition, seller_notes: notes })
  }

  return (
    <ModalShell title="Record Return Receipt" onClose={onClose} icon={Package}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Item condition
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCondition(c.id)}
                className={
                  'text-left px-3 py-2 rounded border text-sm ' +
                  (condition === c.id
                    ? 'border-[#c7511f] bg-orange-50 font-medium'
                    : 'border-gray-300 hover:border-gray-400')
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Seller notes (optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Unit functions but shows signs of wear."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

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
            disabled={busy}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Mark Received'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function RefundModal({ ret, onClose, onSubmit, busy }) {
  const maxRefund = Number(ret.order_total || 0)
  const [type, setType] = useState('full')
  const [amount, setAmount] = useState(maxRefund.toFixed(2))
  const [restocking, setRestocking] = useState('0')
  const [reason, setReason] = useState('Item received as described')

  function handleSubmit(e) {
    e.preventDefault()
    const finalAmount =
      type === 'full'
        ? Math.max(0, maxRefund - Number(restocking || 0))
        : Number(amount)
    onSubmit({
      type,
      amount: finalAmount,
      restocking_fee: Number(restocking || 0),
      reason,
    })
  }

  const netRefund =
    type === 'full'
      ? Math.max(0, maxRefund - Number(restocking || 0))
      : Math.max(0, Number(amount) || 0)

  return (
    <ModalShell title="Issue Refund" onClose={onClose} icon={DollarSign}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'full', label: 'Full Refund' },
            { id: 'partial', label: 'Partial Refund' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={
                'py-2.5 rounded border text-sm font-medium ' +
                (type === t.id
                  ? 'border-[#c7511f] bg-orange-50 text-[#c7511f]'
                  : 'border-gray-300 hover:border-gray-400')
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order total</span>
            <span className="text-gray-900">${maxRefund.toFixed(2)}</span>
          </div>
        </div>

        {type === 'partial' && (
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Refund amount
            </label>
            <div className="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 bg-white">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={maxRefund}
                className="flex-1 text-sm focus:outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Restocking fee (optional)
          </label>
          <div className="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 bg-white">
            <span className="text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={restocking}
              onChange={(e) => setRestocking(e.target.value)}
              min="0"
              max={maxRefund}
              className="flex-1 text-sm focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Deducted from the refund. Use only for items returned damaged.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option>Item received as described</option>
            <option>Item damaged on arrival</option>
            <option>Item not as described</option>
            <option>Goodwill refund</option>
          </select>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-3">
          <div className="flex justify-between text-sm font-bold text-green-900">
            <span>Net refund to customer</span>
            <span>${netRefund.toFixed(2)}</span>
          </div>
        </div>

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
            disabled={busy}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2 rounded text-sm disabled:opacity-60"
          >
            {busy ? 'Processing…' : `Issue ${type === 'full' ? 'Full' : 'Partial'} Refund`}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}