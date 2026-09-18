import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  RefreshCw,
  Check,
  Trash2,
  Filter,
} from 'lucide-react'
import { useSellerNotifications } from '../../hooks/useSellerNotifications'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

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
  const { user } = useAuth()
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            {unreadCount > 0 && (
              <>
                {' · '}
                <span className="text-[#c7511f] font-medium">
                  {unreadCount} unread
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await markAllRead()
              pushToast('All marked as read', { type: 'success' })
            }}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
          <button
            onClick={reload}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 border-b overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={
              'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition ' +
              (filter === f.id
                ? 'border-[#c7511f] text-[#c7511f]'
                : 'border-transparent text-gray-600 hover:text-gray-900')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-600">
            Loading notifications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-sm text-gray-600">
              You're all caught up.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type] || { label: 'Notice', emoji: '🔔' }
              const unread = !n.read && !n.derived
              return (
                <li
                  key={n.id}
                  className={
                    'flex items-start gap-4 px-5 py-4 transition ' +
                    (unread ? 'bg-orange-50/40' : 'hover:bg-gray-50')
                  }
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{meta.emoji}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs uppercase tracking-wider text-gray-500">
                        {meta.label}
                      </span>
                      {unread && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#c7511f] text-white">
                          NEW
                        </span>
                      )}
                      {n.derived && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          AUTO
                        </span>
                      )}
                    </div>
                    <Link
                      to={n.link || '/seller'}
                      className={
                        'block ' +
                        (unread
                          ? 'font-bold text-gray-900'
                          : 'font-medium text-gray-800') +
                        ' hover:text-[#c7511f]'
                      }
                    >
                      {n.title}
                    </Link>
                    {n.body && (
                      <div className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                        {n.body}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {unread && (
                      <button
                        onClick={() => handleMarkRead(n)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    {!n.derived && (
                      <button
                        onClick={() => handleRemove(n)}
                        className="p-1.5 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-500">
        <strong>Auto</strong> notices reflect the current state of your account
        and cannot be dismissed. Other notices are recorded events.
      </p>
    </div>
  )
}