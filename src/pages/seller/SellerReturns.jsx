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
  XCircle,
  CheckCircle2,
  ArrowRight,
  Download,
  Settings as SettingsIcon,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerReturns, computeReturnsSummary } from '../../services/sellerService'

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
  requested: { label: 'Requested', cls: 'bg-blue-100 text-blue-800' },
  pending_authorization: { label: 'Pending Authorization', cls: 'bg-amber-100 text-amber-800' },
  authorized: { label: 'Authorized', cls: 'bg-blue-100 text-blue-800' },
  return_in_transit: { label: 'In Transit', cls: 'bg-indigo-100 text-indigo-800' },
  return_received: { label: 'Received', cls: 'bg-cyan-100 text-cyan-800' },
  refund_pending: { label: 'Refund Pending', cls: 'bg-amber-100 text-amber-800' },
  refunded: { label: 'Refunded', cls: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', cls: 'bg-red-100 text-red-800' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-800' },
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
    } catch (err) {
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Seller-Fulfilled Returns
          </h1>
          <p className="text-sm text-gray-600">
            Manage customer returns, refunds, and return requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Report
          </button>
          <button
            onClick={load}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryTile
          label="Pending Actions"
          value={summary.pendingActions}
          icon={Clock}
          tone="amber"
        />
        <SummaryTile
          label="In Transit"
          value={summary.inTransit}
          icon={Truck}
          tone="blue"
        />
        <SummaryTile
          label="Returns Received"
          value={summary.received}
          icon={Package}
          tone="cyan"
        />
        <SummaryTile
          label="Refunds Pending"
          value={summary.refundPending}
          icon={DollarSign}
          tone="amber"
        />
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by RMA, Order ID, product, SKU, customer, or tracking..."
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const count = returns.filter((r) => matchesTab(r, t.id)).length
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition flex items-center gap-2 ' +
                (tab === t.id
                  ? 'border-[#c7511f] text-[#c7511f]'
                  : 'border-transparent text-gray-600 hover:text-gray-900')
              }
            >
              {t.label}
              {count > 0 && (
                <span
                  className={
                    'text-xs px-1.5 py-0.5 rounded-full ' +
                    (tab === t.id
                      ? 'bg-orange-100 text-[#c7511f]'
                      : 'bg-gray-100 text-gray-600')
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
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-600">
            Loading returns…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState tab={tab} hasQuery={query.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Return ID</th>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Reason</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Refund</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const status = STATUS_META[r.status] || {
                    label: r.status,
                    cls: 'bg-gray-100 text-gray-700',
                  }
                  return (
                    <tr
                      key={r.id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/seller/orders/returns/${r.id}`)}
                    >
                      <td className="px-5 py-3">
                        <div className="font-mono text-xs text-gray-700">
                          {r.rma || r.id.slice(0, 8)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(r.requested_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {r.product_image ? (
                            <img
                              src={r.product_image}
                              alt=""
                              className="w-9 h-9 rounded object-cover border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[220px]">
                              {r.product_title}
                            </div>
                            {r.product_sku && (
                              <div className="text-xs text-gray-500 font-mono">
                                {r.product_sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">
                        {r.customer_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm max-w-[180px] truncate">
                        {r.return_reason || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            'inline-block text-xs font-medium px-2 py-0.5 rounded-full ' +
                            status.cls
                          }
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Number(r.refund_amount) > 0 ? (
                          <span className="font-medium text-green-700">
                            -${Number(r.refund_amount).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[#007185] hover:text-[#c7511f] text-sm">
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
      <div className="flex flex-wrap gap-3">
        <Link
          to="/seller/orders/returns/analytics"
          className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1"
        >
          <BarChart3 className="w-4 h-4" /> Return Analytics
        </Link>
        <Link
          to="/seller/orders/returns/settings"
          className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1"
        >
          <SettingsIcon className="w-4 h-4" /> Return Settings
        </Link>
      </div>
    </div>
  )
}

function SummaryTile({ label, value, icon: Icon, tone }) {
  const toneCls = {
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-900',
  }[tone] || 'border-gray-200 bg-white text-gray-900'
  return (
    <div className={'border rounded-lg p-4 ' + toneCls}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider opacity-70">{label}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function EmptyState({ tab, hasQuery }) {
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
    <div className="p-12 text-center">
      <RotateCcw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">
        {hasQuery ? 'No returns match your search' : messages[tab]}
      </h3>
      {hasQuery && (
        <p className="text-sm text-gray-600">Try a different keyword.</p>
      )}
    </div>
  )
}