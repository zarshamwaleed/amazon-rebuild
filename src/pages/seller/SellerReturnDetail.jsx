import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Package,
  User,
  Truck,
  DollarSign,
  RotateCcw,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  MapPin,
  FileText,
  ClipboardCheck,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
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
  requested: { label: 'Requested', color: 'blue' },
  pending_authorization: { label: 'Pending Authorization', color: 'yellow' },
  authorized: { label: 'Authorized', color: 'blue' },
  return_in_transit: { label: 'Return In Transit', color: 'blue' },
  return_received: { label: 'Return Received', color: 'blue' },
  refund_pending: { label: 'Refund Pending', color: 'yellow' },
  refunded: { label: 'Refunded', color: 'green' },
  declined: { label: 'Declined', color: 'red' },
  completed: { label: 'Completed', color: 'green' },
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

const fieldCls =
  'w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400'

export default function SellerReturnDetail() {
  const { returnId } = useParams()
  const { user } = useAuth()
  const { pushToast } = useToast()

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
    } catch {
      pushToast('Could not load return', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user, returnId])

  const currentStep = useMemo(() => (ret ? returnTimelineIndex(ret.status) : 0), [ret])

  async function handleAuthorize(payload) {
    setBusy(true)
    try {
      await authorizeReturn(user.id, ret.id, payload)
      pushToast('Return authorized', { type: 'success' })
      setShowAuthorize(false)
      await load()
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      pushToast('Could not send message', { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 max-w-5xl animate-fade-in">
        <div className="h-16 rounded-xl skeleton-shimmer" />
        <div className="h-28 rounded-xl skeleton-shimmer" />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-64 rounded-xl skeleton-shimmer" />
          <div className="h-64 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    )
  }

  if (!ret) {
    return (
      <EmptyState
        icon={RotateCcw}
        title="Return not found"
        message="This return doesn't exist or doesn't belong to you."
        action={
          <Link to="/seller/orders/returns" className="text-sm font-medium text-brass-600 hover:text-brass-700">
            ← Back to returns
          </Link>
        }
      />
    )
  }

  const status = STATUS_META[ret.status] || STATUS_META.requested
  const needsAction = ret.status === 'requested' || ret.status === 'pending_authorization'
  const canShip = ret.status === 'authorized'
  const canReceive = ret.status === 'return_in_transit'
  const canRefund = ret.status === 'refund_pending'
  const refunded = ret.status === 'refunded'

  return (
    <div className="space-y-5 max-w-5xl pb-10 animate-fade-in">
      <SellerPageHeader
        backTo="/seller/orders/returns"
        title={
          <span className="font-mono">{ret.rma || ret.id.slice(0, 8)}</span>
        }
        description="Return details"
        actions={<Badge color={status.color}>{status.label}</Badge>}
      />

      {/* Timeline */}
      {ret.status !== 'declined' && (
        <Card title="Return Timeline">
          <ol className="flex items-start gap-1 overflow-x-auto no-scrollbar pb-2">
            {TIMELINE_STEPS.map((step, i) => {
              const done = i < currentStep
              const active = i === currentStep
              return (
                <li key={step.key} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-2 min-w-[110px]">
                    <div
                      className={
                        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-avenzo ' +
                        (done
                          ? 'bg-success-500 border-success-500 text-bone-50'
                          : active
                          ? 'bg-brass-400 border-brass-400 text-charcoal-900'
                          : 'bg-bone-50 border-stone-300 text-charcoal-400')
                      }
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                      className={
                        'text-xs text-center leading-tight ' +
                        (active
                          ? 'font-semibold text-brass-700'
                          : done
                          ? 'text-charcoal-800'
                          : 'text-charcoal-400')
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={
                        'h-0.5 w-8 -mt-5 ' + (i < currentStep ? 'bg-success-500' : 'bg-stone-200')
                      }
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </Card>
      )}

      {ret.status === 'declined' && (
        <div className="bg-error-50 border border-error-500/25 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-error-700">This return was declined</div>
            {ret.seller_notes && <div className="text-sm text-error-700/90 mt-1">{ret.seller_notes}</div>}
          </div>
        </div>
      )}

      {/* Action bar */}
      {needsAction && (
        <div className="bg-warning-50 border border-warning-500/25 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-warning-700">This return requires your attention</div>
              <div className="text-sm text-warning-700/90 mt-0.5">
                Customer reason: <strong>{ret.return_reason}</strong>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDecline(true)}>
              Decline
            </Button>
            <Button variant="secondary" onClick={() => setShowAuthorize(true)}>
              Authorize Return
            </Button>
          </div>
        </div>
      )}

      {canShip && (
        <div className="bg-info-50 border border-info-500/25 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-info-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-info-700">Waiting for the customer to ship</div>
              <div className="text-sm text-info-700/90 mt-0.5">
                Tracking: <span className="font-mono">{ret.tracking_number}</span> · {ret.carrier}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleMarkShipped} loading={busy}>
            Mark as Shipped
          </Button>
        </div>
      )}

      {canReceive && (
        <div className="bg-info-50 border border-info-500/25 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-info-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-info-700">Return in transit</div>
              <div className="text-sm text-info-700/90 mt-0.5">
                Once you physically receive the item, record its condition.
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setShowReceive(true)}>
            Record Receipt
          </Button>
        </div>
      )}

      {canRefund && (
        <div className="bg-success-50 border border-success-500/25 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-success-700">Return received — refund pending</div>
              <div className="text-sm text-success-700/90 mt-0.5">
                Item condition: <strong className="capitalize">{ret.condition || 'used'}</strong>
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setShowRefund(true)}>
            Issue Refund
          </Button>
        </div>
      )}

      {refunded && (
        <div className="bg-success-50 border border-success-500/25 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success-500" />
          <div>
            <div className="font-semibold text-success-700">Refund completed</div>
            <div className="text-sm text-success-700/90">
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
          <Card
            title={
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-charcoal-500" /> Product
              </span>
            }
          >
            <div className="flex gap-4">
              {ret.product_image ? (
                <img src={ret.product_image} alt="" className="w-20 h-20 rounded-lg object-cover border border-stone-200" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-stone-100" />
              )}
              <div className="min-w-0">
                <div className="font-medium text-charcoal-900">{ret.product_title}</div>
                {ret.product_sku && (
                  <div className="text-xs text-charcoal-500 font-mono mt-0.5">SKU: {ret.product_sku}</div>
                )}
                <div className="text-sm text-charcoal-700 mt-2">
                  Order Total: <strong className="text-charcoal-900">${Number(ret.order_total || 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-5">
            <Card
              title={
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-charcoal-500" /> Customer
                </span>
              }
            >
              <div className="text-sm text-charcoal-700">
                <div className="font-medium text-charcoal-900">{ret.customer_name}</div>
                {ret.customer_email && <div className="text-xs text-charcoal-500 mt-0.5">{ret.customer_email}</div>}
              </div>
            </Card>

            <Card
              title={
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-charcoal-500" /> Order
                </span>
              }
            >
              <div className="text-sm text-charcoal-700">
                <div className="font-mono text-xs text-charcoal-600">{ret.order_id ? ret.order_id.slice(0, 8) : '—'}</div>
                <div className="text-xs text-charcoal-500 mt-1">
                  Requested {new Date(ret.requested_at).toLocaleDateString()}
                </div>
                {ret.order_id && (
                  <Link to={`/seller/orders/${ret.order_id}`} className="text-brass-600 hover:text-brass-700 text-xs mt-2 inline-block">
                    View order →
                  </Link>
                )}
              </div>
            </Card>
          </div>

          <Card
            title={
              <span className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-charcoal-500" /> Return Reason
              </span>
            }
          >
            <div className="space-y-3">
              <div>
                <div className="text-label mb-1">Customer reason</div>
                <div className="text-sm font-medium text-charcoal-900">{ret.return_reason}</div>
              </div>
              {ret.customer_comment && (
                <div>
                  <div className="text-label mb-1">Customer comment</div>
                  <div className="text-sm text-charcoal-700 italic bg-stone-50 border border-stone-200 rounded-lg p-3">
                    "{ret.customer_comment}"
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card
            padding="none"
            title={
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-charcoal-500" /> Customer Messages
              </span>
            }
          >
            <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <p className="text-body-sm text-center py-4">No messages yet. Start the conversation below.</p>
              ) : (
                messages.map((m) => {
                  const outbound = m.direction === 'outbound'
                  return (
                    <div key={m.id} className={'flex ' + (outbound ? 'justify-end' : 'justify-start')}>
                      <div
                        className={
                          'max-w-[75%] rounded-lg px-3 py-2 text-sm ' +
                          (outbound ? 'bg-charcoal-900 text-bone-50' : 'bg-stone-100 text-charcoal-800')
                        }
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {outbound ? 'You' : m.author || ret.customer_name} · {new Date(m.created_at).toLocaleString()}
                        </div>
                        {m.body}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="border-t border-stone-200 p-4">
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
                  className={fieldCls + ' resize-none'}
                />
                <Button type="submit" disabled={!newMessage.trim()} loading={busy} className="flex-shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Right: shipping + refund summary */}
        <div className="space-y-5">
          <Card
            title={
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-charcoal-500" /> Return Shipping
              </span>
            }
          >
            {ret.tracking_number ? (
              <dl className="text-sm space-y-2">
                <div className="flex justify-between">
                  <dt className="text-charcoal-500">Carrier</dt>
                  <dd className="text-charcoal-900">{ret.carrier}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-charcoal-500">Tracking</dt>
                  <dd className="text-charcoal-900 font-mono text-xs">{ret.tracking_number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-charcoal-500">Method</dt>
                  <dd className="text-charcoal-900 capitalize">
                    {(ret.return_method || 'prepaid_label').replace(/_/g, ' ')}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-body-sm">Not authorized yet. Tracking will be generated on authorization.</p>
            )}
          </Card>

          <Card
            title={
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-charcoal-500" /> Refund
              </span>
            }
          >
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-charcoal-500">Order total</dt>
                <dd className="text-charcoal-900">${Number(ret.order_total || 0).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500">Restocking fee</dt>
                <dd className="text-charcoal-900">
                  {Number(ret.restocking_fee) > 0 ? '-$' + Number(ret.restocking_fee).toFixed(2) : '—'}
                </dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 font-semibold text-charcoal-900">
                <dt>Refunded</dt>
                <dd>{Number(ret.refund_amount) > 0 ? '$' + Number(ret.refund_amount).toFixed(2) : '—'}</dd>
              </div>
            </dl>
          </Card>

          {ret.seller_notes && (
            <Card
              title={
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-charcoal-500" /> Seller Notes
                </span>
              }
            >
              <p className="text-sm text-charcoal-700">{ret.seller_notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAuthorize && (
        <AuthorizeModal ret={ret} onClose={() => setShowAuthorize(false)} onSubmit={handleAuthorize} busy={busy} />
      )}
      {showDecline && <DeclineModal onClose={() => setShowDecline(false)} onSubmit={handleDecline} busy={busy} />}
      {showReceive && <ReceiveModal onClose={() => setShowReceive(false)} onSubmit={handleReceive} busy={busy} />}
      {showRefund && <RefundModal ret={ret} onClose={() => setShowRefund(false)} onSubmit={handleRefund} busy={busy} />}
    </div>
  )
}

/* ============================================================
   Modals
   ============================================================ */

function ModalShell({ title, onClose, children, icon }) {
  const Icon = icon
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-xl shadow-lifted border border-stone-200 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="border-b border-stone-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-charcoal-500" />}
            <h2 className="heading-sub">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo" aria-label="Close">
            <X className="w-4 h-4 text-charcoal-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function RadioCard({ selected, onClick, children }) {
  return (
    <label
      onClick={onClick}
      className={
        'flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-sm transition-avenzo ' +
        (selected ? 'border-brass-400 bg-brass-50' : 'border-stone-300 hover:border-stone-400')
      }
    >
      <input type="radio" checked={selected} readOnly className="accent-brass-500" />
      {children}
    </label>
  )
}

function AuthorizeModal({ ret, onClose, onSubmit, busy }) {
  const [method, setMethod] = useState('prepaid_label')
  const [carrier, setCarrier] = useState('UPS')
  const [address, setAddress] = useState('Returns Dept · 123 Warehouse Rd · Karachi · 75500 · Pakistan')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ return_method: method, carrier, return_address: address })
  }

  return (
    <ModalShell title="Authorize Return" onClose={onClose} icon={Truck}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-charcoal-600">
          RMA <strong className="text-charcoal-900">{ret.rma}</strong> will be sent to the customer, along with a
          prepaid return label.
        </div>

        <div>
          <label className="block text-label mb-2">Return method</label>
          <div className="space-y-2">
            {[
              { id: 'prepaid_label', label: 'Amazon prepaid label' },
              { id: 'seller_label', label: 'Seller-provided label' },
            ].map((m) => (
              <RadioCard key={m.id} selected={method === m.id} onClick={() => setMethod(m.id)}>
                {m.label}
              </RadioCard>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-label mb-1.5">Carrier</label>
          <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className={fieldCls}>
            <option>UPS</option>
            <option>USPS</option>
            <option>FedEx</option>
            <option>DHL</option>
          </select>
        </div>

        <div>
          <label className="block text-label mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Seller return address
          </label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={fieldCls + ' resize-none'}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" loading={busy}>
            Authorize Return
          </Button>
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
        <div className="bg-error-50 border border-error-500/25 text-error-700 text-xs rounded-lg p-3">
          Declining a return is subject to your return policy. The customer will be notified and can appeal through
          Amazon Rebuild support.
        </div>

        <div>
          <label className="block text-label mb-1.5">Reason for declining</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={fieldCls}>
            {DECLINE_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-label mb-1.5">Additional information</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain your decision to the customer…"
            className={fieldCls + ' resize-none'}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={busy}>
            Decline Request
          </Button>
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
          <label className="block text-label mb-2">Item condition</label>
          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCondition(c.id)}
                className={
                  'text-left px-3 py-2 rounded-lg border text-sm transition-avenzo ' +
                  (condition === c.id ? 'border-brass-400 bg-brass-50 font-medium text-charcoal-900' : 'border-stone-300 hover:border-stone-400 text-charcoal-700')
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-label mb-1.5">Seller notes (optional)</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Unit functions but shows signs of wear."
            className={fieldCls + ' resize-none'}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" loading={busy}>
            Mark Received
          </Button>
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
    const finalAmount = type === 'full' ? Math.max(0, maxRefund - Number(restocking || 0)) : Number(amount)
    onSubmit({
      type,
      amount: finalAmount,
      restocking_fee: Number(restocking || 0),
      reason,
    })
  }

  const netRefund =
    type === 'full' ? Math.max(0, maxRefund - Number(restocking || 0)) : Math.max(0, Number(amount) || 0)

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
                'py-2.5 rounded-lg border text-sm font-medium transition-avenzo ' +
                (type === t.id ? 'border-brass-400 bg-brass-50 text-brass-700' : 'border-stone-300 hover:border-stone-400 text-charcoal-700')
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal-500">Order total</span>
            <span className="text-charcoal-900">${maxRefund.toFixed(2)}</span>
          </div>
        </div>

        {type === 'partial' && (
          <div>
            <label className="block text-label mb-1.5">Refund amount</label>
            <div className="flex items-center gap-1 border border-stone-300 rounded-lg px-3.5 py-2.5 bg-bone-50">
              <span className="text-charcoal-500">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={maxRefund}
                className="flex-1 text-sm bg-transparent focus:outline-none text-charcoal-900"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-label mb-1.5">Restocking fee (optional)</label>
          <div className="flex items-center gap-1 border border-stone-300 rounded-lg px-3.5 py-2.5 bg-bone-50">
            <span className="text-charcoal-500">$</span>
            <input
              type="number"
              step="0.01"
              value={restocking}
              onChange={(e) => setRestocking(e.target.value)}
              min="0"
              max={maxRefund}
              className="flex-1 text-sm bg-transparent focus:outline-none text-charcoal-900"
            />
          </div>
          <p className="text-caption mt-1.5">Deducted from the refund. Use only for items returned damaged.</p>
        </div>

        <div>
          <label className="block text-label mb-1.5">Reason</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={fieldCls}>
            <option>Item received as described</option>
            <option>Item damaged on arrival</option>
            <option>Item not as described</option>
            <option>Goodwill refund</option>
          </select>
        </div>

        <div className="bg-success-50 border border-success-500/25 rounded-lg p-3">
          <div className="flex justify-between text-sm font-semibold text-success-700">
            <span>Net refund to customer</span>
            <span>${netRefund.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" loading={busy}>
            {`Issue ${type === 'full' ? 'Full' : 'Partial'} Refund`}
          </Button>
        </div>
      </form>
    </ModalShell>
  )
}
