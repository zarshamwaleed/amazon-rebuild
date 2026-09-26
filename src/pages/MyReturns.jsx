import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RotateCcw,
  Package,
  Truck,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Check,
  Quote,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getCustomerReturns } from '../services/customerReturnService'
import Button from '../components/Button'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { formatPrice } from '../lib/utils'

const STATUS_META = {
  requested: { label: 'Requested', color: 'blue', icon: Clock },
  pending_authorization: { label: 'Pending Authorization', color: 'yellow', icon: Clock },
  authorized: { label: 'Authorized', color: 'blue', icon: Truck },
  return_in_transit: { label: 'In Transit', color: 'blue', icon: Truck },
  return_received: { label: 'Received', color: 'blue', icon: Package },
  refund_pending: { label: 'Refund Pending', color: 'yellow', icon: DollarSign },
  refunded: { label: 'Refunded', color: 'green', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'green', icon: CheckCircle2 },
  declined: { label: 'Declined', color: 'red', icon: XCircle },
}

// Where a return's status sits along the customer-facing timeline.
// pending_authorization is folded into "Requested"; refund_pending and
// refunded/completed both live at the final "Refund" step (the step's
// description text distinguishes in-progress from issued).
function timelineIndex(status) {
  switch (status) {
    case 'requested':
    case 'pending_authorization':
      return 0
    case 'authorized':
      return 1
    case 'return_in_transit':
      return 2
    case 'return_received':
      return 3
    case 'refund_pending':
    case 'refunded':
    case 'completed':
      return 4
    default:
      return 0
  }
}

function timelineSteps(status) {
  const refundDescription =
    status === 'refunded' || status === 'completed'
      ? 'Refund has been issued'
      : status === 'refund_pending'
        ? 'Your refund is being processed'
        : "You'll be refunded once your return is processed"
  return [
    { id: 'requested', label: 'Requested', description: 'We received your return request' },
    { id: 'authorized', label: 'Authorized', description: 'Ship the item back with the provided label' },
    { id: 'return_in_transit', label: 'In Transit', description: 'On the way to the seller' },
    { id: 'return_received', label: 'Received', description: 'The seller has your item' },
    { id: 'refund', label: 'Refund', description: refundDescription },
  ]
}

// Local presentational variant of OrderStatusTimeline's visual language —
// same dot/line/check pattern — but built around the returns status set,
// which OrderStatusTimeline's hardcoded shipping steps don't cover.
function ReturnTimeline({ status }) {
  const declined = status === 'declined'
  const steps = timelineSteps(status)
  const activeIndex = declined ? 0 : timelineIndex(status)

  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const done = !declined && i <= activeIndex
        const current = !declined && i === activeIndex
        return (
          <li key={step.id} className="flex gap-3.5 pb-6 last:pb-0 relative">
            {i < steps.length - 1 && (
              <span
                className={
                  'absolute left-[13px] top-7 bottom-0 w-px ' +
                  (i < activeIndex && !declined ? 'bg-brass-400' : 'bg-stone-200')
                }
              />
            )}
            <span
              className={
                'relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-avenzo ' +
                (done
                  ? current
                    ? 'bg-brass-400 border-brass-400 text-charcoal-900'
                    : 'bg-charcoal-900 border-charcoal-900 text-bone-50'
                  : 'bg-bone-50 border-stone-300 text-stone-300')
              }
            >
              {done ? (
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </span>
            <div className="pt-0.5">
              <div
                className={
                  'text-sm font-medium ' +
                  (current ? 'text-charcoal-900' : done ? 'text-charcoal-800' : 'text-charcoal-400')
                }
              >
                {step.label}
              </div>
              <div className="text-caption">{step.description}</div>
            </div>
          </li>
        )
      })}
      {declined && (
        <li className="flex gap-3.5 relative pt-1">
          <span className="relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-error-50 border-2 border-error-500 text-error-700">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </span>
          <div className="pt-0.5">
            <div className="text-sm font-medium text-error-700">Declined</div>
            <div className="text-caption">The seller declined this return request</div>
          </div>
        </li>
      )}
    </ol>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function MyReturns() {
  const { user } = useAuth()
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    if (!user?.email) return
    try {
      setLoading(true)
      setError(null)
      const list = await getCustomerReturns(user.email)
      setReturns(list)
    } catch (err) {
      setError(err.message || 'Could not load your returns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  if (!user) {
    return (
      <EmptyState
        icon={RotateCcw}
        title="Sign in to view your returns"
        message="Track your return requests and refunds once you're signed in."
        action={
          <Link to="/login">
            <Button>Sign in</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <nav className="text-caption mb-4">
        <Link to="/orders" className="hover:text-charcoal-800 hover:underline">
          Your Orders
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-charcoal-700">Returns</span>
      </nav>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="heading-page">Your Returns</h1>
          <p className="text-body-sm mt-1.5">Track your return requests and refunds.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-5">
          {[0, 1].map((i) => (
            <div key={i} className="bg-bone-50 border border-stone-200 rounded-xl overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 px-5 sm:px-6 py-4">
                <div className="skeleton-shimmer h-3 w-28 rounded" />
              </div>
              <div className="px-5 sm:px-6 py-5 flex gap-4">
                <div className="skeleton-shimmer w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2.5 pt-1">
                  <div className="skeleton-shimmer h-3.5 w-2/3 rounded" />
                  <div className="skeleton-shimmer h-3 w-1/3 rounded" />
                  <div className="skeleton-shimmer h-3 w-1/4 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Could not load returns" message={error} />
      ) : returns.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No returns yet"
          message={'To return an item, open your order history and click "Return this item" next to the product you want to return.'}
          action={
            <Link to="/orders">
              <Button>
                <Package className="w-4 h-4" /> View your orders
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-body-sm mb-4">
            {returns.length} return{returns.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-5">
            {returns.map((r) => {
              const meta = STATUS_META[r.status] || STATUS_META.requested
              const Icon = meta.icon
              const hasRefund = Number(r.refund_amount) > 0

              return (
                <div
                  key={r.id}
                  className="bg-bone-50 border border-stone-200 rounded-xl overflow-hidden transition-avenzo hover:border-stone-300 hover:shadow-soft"
                >
                  {/* Header strip */}
                  <div className="bg-stone-50 border-b border-stone-200 px-5 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-metadata">{r.rma}</span>
                      <Badge color={meta.color}>
                        <Icon className="w-3 h-3" strokeWidth={2.5} />
                        {meta.label}
                      </Badge>
                    </div>
                    <span className="text-caption">Requested {formatDate(r.requested_at)}</span>
                  </div>

                  {/* Body */}
                  <div className="px-5 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: item, reason, refund */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-start gap-4">
                        {r.product_image ? (
                          <img
                            src={r.product_image}
                            alt=""
                            className="w-16 h-16 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-stone-100 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-body font-medium text-charcoal-900 line-clamp-2">
                            {r.product_title}
                          </div>
                          <div className="text-body-sm mt-1">Reason: {r.return_reason}</div>
                          {r.customer_comment && (
                            <div className="text-body-sm text-charcoal-500 italic mt-2 flex gap-1.5">
                              <Quote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>{r.customer_comment}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-body-sm text-charcoal-700">
                          <DollarSign className="w-4 h-4 text-charcoal-400" />
                          {r.status === 'declined'
                            ? 'No refund — return declined'
                            : hasRefund
                              ? 'Refund issued'
                              : r.status === 'refund_pending'
                                ? 'Refund processing'
                                : 'No refund yet'}
                        </div>
                        {hasRefund && (
                          <div className="text-price text-success-700">{formatPrice(r.refund_amount)}</div>
                        )}
                      </div>

                      {r.tracking_number && (
                        <div className="text-caption">
                          Tracking: <span className="font-mono">{r.tracking_number}</span>
                          {r.carrier ? ' · ' + r.carrier : ''}
                        </div>
                      )}

                      {r.order_id && (
                        <Link
                          to={'/orders/' + r.order_id}
                          className="text-sm font-medium text-charcoal-900 hover:text-brass-600 underline underline-offset-2 inline-block"
                        >
                          View order details
                        </Link>
                      )}
                    </div>

                    {/* Right: status timeline */}
                    <div className="lg:col-span-1 lg:border-l lg:border-stone-200 lg:pl-6">
                      <div className="text-label mb-4">Return status</div>
                      <ReturnTimeline status={r.status} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
