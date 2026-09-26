import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RotateCcw,
  Search,
  RefreshCw,
  Clock,
  Truck,
  Package,
  DollarSign,
  ArrowRight,
  Download,
  Settings as SettingsIcon,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerReturns, computeReturnsSummary } from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import SellerStatCard from '../../components/seller/SellerStatCard'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

const TABS = [
  { id: 'all', label: 'All Returns' },
  { id: 'pending', label: 'Pending Actions' },
  { id: 'pending_auth', label: 'Pending Authorization' },
  { id: 'awaiting', label: 'Awaiting Return' },
  { id: 'received', label: 'Return Received' },
  { id: 'refund_pending', label: 'Refund Pending' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'completed', label: 'Completed' },
  { id: 'declined', label: 'Declined' },
]

const STATUS_META = {
  requested: { label: 'Requested', color: 'blue' },
  pending_authorization: { label: 'Pending Authorization', color: 'yellow' },
  authorized: { label: 'Authorized', color: 'blue' },
  return_in_transit: { label: 'In Transit', color: 'blue' },
  return_received: { label: 'Received', color: 'blue' },
  refund_pending: { label: 'Refund Pending', color: 'yellow' },
  refunded: { label: 'Refunded', color: 'green' },
  declined: { label: 'Declined', color: 'red' },
  completed: { label: 'Completed', color: 'green' },
}

function matchesTab(r, tab) {
  if (tab === 'all') return true
  if (tab === 'pending') return ['requested', 'pending_authorization'].includes(r.status)
  if (tab === 'pending_auth') return r.status === 'pending_authorization'
  if (tab === 'awaiting')
    return ['authorized', 'return_in_transit'].includes(r.status)
  if (tab === 'received') return r.status === 'return_received'
  if (tab === 'refund_pending') return r.status === 'refund_pending'
  if (tab === 'refunded') return r.status === 'refunded'
  if (tab === 'completed') return r.status === 'completed'
  if (tab === 'declined') return r.status === 'declined'
  return true
}

export default function SellerReturns() {
  const { user } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const list = await getSellerReturns(user.id)
      setReturns(list)
    } catch {
      pushToast('Could not load returns', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const summary = useMemo(() => computeReturnsSummary(returns), [returns])

  const filtered = useMemo(() => {
    let list = returns.filter((r) => matchesTab(r, tab))
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          (r.rma || '').toLowerCase().includes(q) ||
          (r.order_id || '').toLowerCase().includes(q) ||
          (r.product_title || '').toLowerCase().includes(q) ||
          (r.product_sku || '').toLowerCase().includes(q) ||
          (r.customer_name || '').toLowerCase().includes(q) ||
          (r.tracking_number || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [returns, tab, query])

  function handleDownload() {
    if (returns.length === 0) {
      pushToast('No returns to export', { type: 'info' })
      return
    }
    const rows = [
      ['RMA','Order ID','Product','SKU','Customer','Reason','Status','Refund Status','Refund Amount','Requested','Tracking'],
      ...returns.map((r) => [
        r.rma || '',
        r.order_id || '',
        r.product_title || '',
        r.product_sku || '',
        r.customer_name || '',
        r.return_reason || '',
        r.status || '',
        r.refund_status || '',
        r.refund_amount || 0,
        r.requested_at ? new Date(r.requested_at).toISOString().slice(0, 10) : '',
        r.tracking_number || '',
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'returns-report-' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)
    pushToast('Returns report downloaded', { type: 'success' })
  }

  return (
    <div className="space-y-6">
      <SellerPageHeader
        title="Manage Seller-Fulfilled Returns"
        description="Manage customer returns, refunds, and return requests."
        actions={
          <>
            <Button variant="outline" size="md" onClick={handleDownload}>
              <Download className="w-4 h-4" /> Report
            </Button>
            <Button variant="outline" size="md" onClick={load}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        }
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SellerStatCard label="Pending Actions" value={summary.pendingActions} icon={Clock} />
        <SellerStatCard label="In Transit" value={summary.inTransit} icon={Truck} />
        <SellerStatCard label="Returns Received" value={summary.received} icon={Package} />
        <SellerStatCard label="Refunds Pending" value={summary.refundPending} icon={DollarSign} />
      </div>

      {/* Search */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex flex-wrap items-center gap-3">
        <Search className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by RMA, Order ID, product, SKU, customer, or tracking..."
          className="flex-1 min-w-[200px] text-sm bg-transparent text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const count = returns.filter((r) => matchesTab(r, t.id)).length
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-avenzo flex items-center gap-2 ' +
                (tab === t.id
                  ? 'border-brass-500 text-charcoal-900'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-800')
              }
            >
              {t.label}
              {count > 0 && (
                <span
                  className={
                    'text-xs px-1.5 py-0.5 rounded-full ' +
                    (tab === t.id ? 'bg-brass-100 text-brass-700' : 'bg-stone-100 text-charcoal-600')
                  }
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <SellerReturnsEmpty tab={tab} hasQuery={query.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-label text-left px-5 py-3">Return ID</th>
                  <th className="text-label text-left px-4 py-3">Product</th>
                  <th className="text-label text-left px-4 py-3">Customer</th>
                  <th className="text-label text-left px-4 py-3">Reason</th>
                  <th className="text-label text-center px-4 py-3">Status</th>
                  <th className="text-label text-right px-4 py-3">Refund</th>
                  <th className="text-label text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((r) => {
                  const status = STATUS_META[r.status] || { label: r.status, color: 'gray' }
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-stone-50/60 transition-avenzo cursor-pointer"
                      onClick={() => navigate(`/seller/orders/returns/${r.id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs text-charcoal-700">
                          {r.rma || r.id.slice(0, 8)}
                        </div>
                        <div className="text-xs text-charcoal-400 mt-0.5">
                          {new Date(r.requested_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {r.product_image ? (
                            <img
                              src={r.product_image}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-charcoal-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-charcoal-900 truncate max-w-[220px]">
                              {r.product_title}
                            </div>
                            {r.product_sku && (
                              <div className="text-xs text-charcoal-500 font-mono">
                                {r.product_sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-700 text-sm">
                        {r.customer_name || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-charcoal-700 text-sm max-w-[180px] truncate">
                        {r.return_reason || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge color={status.color}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {Number(r.refund_amount) > 0 ? (
                          <span className="font-medium text-success-700">
                            -${Number(r.refund_amount).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-charcoal-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-brass-600 hover:text-brass-700 text-sm font-medium">
                          View <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer links */}
      <div className="flex flex-wrap gap-4">
        <Link
          to="/seller/orders/returns/analytics"
          className="text-sm text-brass-600 hover:text-brass-700 font-medium flex items-center gap-1.5 transition-avenzo"
        >
          <BarChart3 className="w-4 h-4" /> Return Analytics
        </Link>
        <Link
          to="/seller/orders/returns/settings"
          className="text-sm text-brass-600 hover:text-brass-700 font-medium flex items-center gap-1.5 transition-avenzo"
        >
          <SettingsIcon className="w-4 h-4" /> Return Settings
        </Link>
      </div>
    </div>
  )
}

function SellerReturnsEmpty({ tab, hasQuery }) {
  const messages = {
    all: 'No returns yet. Returns will appear here when customers request them.',
    pending: 'No returns awaiting your action.',
    pending_auth: 'No returns pending authorization.',
    awaiting: 'No returns currently in transit.',
    received: 'No returns received.',
    refund_pending: 'No refunds pending.',
    refunded: 'No refunds processed yet.',
    completed: 'No completed returns.',
    declined: 'No declined returns.',
  }
  return (
    <EmptyState
      icon={RotateCcw}
      title={hasQuery ? 'No returns match your search' : messages[tab]}
      message={hasQuery ? 'Try a different keyword.' : undefined}
      className="border-0 rounded-none"
    />
  )
}
