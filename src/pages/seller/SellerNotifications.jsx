import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, RefreshCw, Check, Trash2 } from 'lucide-react'
import { useSellerNotifications } from '../../hooks/useSellerNotifications'
import { useToast } from '../../context/ToastContext'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

const TYPE_META = {
  new_order: { label: 'Order', emoji: '🛒' },
  low_inventory: { label: 'Low stock', emoji: '⚠️' },
  product_suppressed: { label: 'Suppressed', emoji: '🚫' },
  customer_message: { label: 'Message', emoji: '✉️' },
  return_requested: { label: 'Return', emoji: '↩️' },
  payment_update: { label: 'Payment', emoji: '💵' },
  policy: { label: 'Policy', emoji: '📋' },
  campaign_update: { label: 'Campaign', emoji: '📣' },
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'order', label: 'Orders' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'message', label: 'Messages' },
  { id: 'policy', label: 'Policy' },
]

function matchesFilter(n, filter) {
  if (filter === 'all') return true
  if (filter === 'unread') return !n.read && !n.derived
  if (filter === 'order') return n.type === 'new_order' || n.type === 'return_requested'
  if (filter === 'inventory')
    return n.type === 'low_inventory' || n.type === 'product_suppressed'
  if (filter === 'message') return n.type === 'customer_message'
  if (filter === 'policy') return n.type === 'policy'
  return true
}

export default function SellerNotifications() {
  const { pushToast } = useToast()
  const {
    notifications,
    loading,
    unreadCount,
    reload,
    markAllRead,
    markRead,
    remove,
  } = useSellerNotifications()

  const [filter, setFilter] = useState('all')

  const filtered = useMemo(
    () => notifications.filter((n) => matchesFilter(n, filter)),
    [notifications, filter]
  )

  async function handleMarkRead(n) {
    if (n.derived) {
      pushToast('This notice reflects current state and cannot be marked read', {
        type: 'info',
      })
      return
    }
    await markRead(n.id)
  }

  async function handleRemove(n) {
    if (n.derived) {
      pushToast('This notice is auto-generated and cannot be deleted', {
        type: 'info',
      })
      return
    }
    await remove(n.id)
    pushToast('Notification removed', { type: 'info' })
  }

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Notifications"
        description={
          <>
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            {unreadCount > 0 && (
              <>
                {' · '}
                <span className="text-brass-600 font-medium">{unreadCount} unread</span>
              </>
            )}
          </>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await markAllRead()
                pushToast('All marked as read', { type: 'success' })
              }}
            >
              <Check className="w-4 h-4" /> Mark all read
            </Button>
            <Button variant="outline" size="sm" onClick={reload} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={
              'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-avenzo ' +
              (filter === f.id
                ? 'border-brass-500 text-charcoal-900'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg skeleton-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'No unread notifications' : "You're all caught up"}
          message="No notifications to show right now."
        />
      ) : (
        <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle divide-y divide-stone-100">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type] || { label: 'Notice', emoji: '🔔' }
            const unread = !n.read && !n.derived
            return (
              <div
                key={n.id}
                className={
                  'flex items-start gap-3 px-4 sm:px-5 py-4 hover:bg-stone-50 transition-avenzo ' +
                  (unread ? 'bg-brass-50/50' : '')
                }
              >
                <span className="text-lg flex-shrink-0 mt-0.5 leading-none">{meta.emoji}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-label">{meta.label}</span>
                    {n.derived && <Badge color="blue">Auto</Badge>}
                  </div>
                  <Link
                    to={n.link || '/seller'}
                    className={
                      'block text-sm hover:text-brass-600 transition-avenzo ' +
                      (unread ? 'font-semibold text-charcoal-900' : 'font-medium text-charcoal-700')
                    }
                  >
                    {n.title}
                  </Link>
                  {n.body && (
                    <div className="text-sm text-charcoal-600 mt-0.5 line-clamp-2">{n.body}</div>
                  )}
                  <div className="text-caption mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {unread && (
                    <button
                      onClick={() => handleMarkRead(n)}
                      className="p-1.5 hover:bg-stone-100 rounded-lg transition-avenzo"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-charcoal-500" />
                    </button>
                  )}
                  {!n.derived && (
                    <button
                      onClick={() => handleRemove(n)}
                      className="p-1.5 hover:bg-error-50 rounded-lg transition-avenzo"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-error-500" />
                    </button>
                  )}
                </div>

                {unread && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brass-500 mt-1.5 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-caption">
        <strong className="text-charcoal-600">Auto</strong> notices reflect the current state of your
        account and cannot be dismissed. Other notices are recorded events.
      </p>
    </div>
  )
}
