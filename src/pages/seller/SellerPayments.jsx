import { useEffect, useMemo, useState } from 'react'
import {
  RefreshCw,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  Search,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerPayments } from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import SellerStatCard from '../../components/seller/SellerStatCard'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import NumberTicker from '../../components/NumberTicker'

const TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'sale', label: 'Sales' },
  { id: 'fee', label: 'Fees' },
  { id: 'refund', label: 'Refunds' },
]

const TYPE_BADGE_COLOR = { Sale: 'green', Fee: 'gray', Refund: 'red' }

export default function SellerPayments() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [query, setQuery] = useState('')

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const p = await getSellerPayments(user.id)
      setData(p)
    } catch {
      pushToast('Could not load payments', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.transactions
    if (typeFilter !== 'all') {
      const t = typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)
      list = list.filter((x) => x.type === t)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (x) =>
          x.order.toLowerCase().includes(q) ||
          (x.description || '').toLowerCase().includes(q) ||
          x.type.toLowerCase().includes(q)
      )
    }
    return list
  }, [data, typeFilter, query])

  function exportCsv() {
    if (!data) return
    const rows = [
      ['Date', 'Order', 'Type', 'Description', 'Amount', 'Fees', 'Net'],
      ...data.transactions.map((t) => [
        new Date(t.date).toISOString(),
        t.order,
        t.type,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.amount,
        t.fees,
        t.net,
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'seller-payments-' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)
    pushToast('Payments exported', { type: 'success' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 rounded-lg skeleton-shimmer" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-32 rounded-xl skeleton-shimmer" />
          <div className="h-32 rounded-xl skeleton-shimmer" />
        </div>
        <div className="h-64 rounded-xl skeleton-shimmer" />
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="space-y-6">
      <SellerPageHeader
        title="Payments"
        description="Your balance, next payout, and transaction history."
        actions={
          <>
            <Button variant="outline" size="md" onClick={exportCsv}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button variant="outline" size="md" onClick={load} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        }
      />

      {/* Top balance cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-brass-300 bg-brass-50 shadow-subtle p-6">
          <div className="flex items-center gap-2 text-label text-brass-700 mb-2">
            <Wallet className="w-4 h-4" /> Available balance
          </div>
          <div className="font-display text-4xl text-brass-700">
            <NumberTicker value={data.availableBalance} formatter={(n) => '$' + n.toFixed(2)} />
          </div>
          <p className="text-caption mt-2">Ready to pay out. Updates as orders complete.</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-bone-50 shadow-subtle p-6">
          <div className="flex items-center gap-2 text-label mb-2">
            <Clock className="w-4 h-4" /> Next payout
          </div>
          <div className="font-display text-4xl text-charcoal-900">
            <NumberTicker value={data.nextPayout} formatter={(n) => '$' + n.toFixed(2)} />
          </div>
          <p className="text-caption mt-2">Scheduled in 14 days from each order date.</p>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SellerStatCard
          label="Total sales"
          value={<NumberTicker value={data.gross} formatter={(n) => '$' + n.toFixed(2)} />}
          icon={TrendingUp}
        />
        <SellerStatCard
          label={`Amazon fees (${data.feeRate}%)`}
          value={<NumberTicker value={data.fees} formatter={(n) => '-$' + n.toFixed(2)} />}
          icon={DollarSign}
          tone="error"
        />
        <SellerStatCard
          label="Refunds"
          value={<NumberTicker value={data.refunds} formatter={(n) => '-$' + n.toFixed(2)} />}
          icon={TrendingDown}
          tone="error"
        />
        <SellerStatCard
          label="Net proceeds"
          value={<NumberTicker value={data.netProceeds} formatter={(n) => '$' + n.toFixed(2)} />}
          icon={Wallet}
          tone="success"
        />
      </div>

      {/* Filters */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={
                'px-3 py-1.5 rounded-full border text-sm font-medium transition-avenzo ' +
                (typeFilter === f.id
                  ? 'bg-charcoal-900 text-bone-50 border-charcoal-900'
                  : 'border-stone-300 text-charcoal-600 hover:border-stone-400 hover:text-charcoal-900')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-charcoal-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order ID or description..."
            className="flex-1 bg-transparent text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No transactions"
            message="Transactions will appear here as customers purchase your products."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-label text-left px-5 py-3">Date</th>
                  <th className="text-label text-left px-4 py-3">Order</th>
                  <th className="text-label text-left px-4 py-3">Type</th>
                  <th className="text-label text-left px-4 py-3">Description</th>
                  <th className="text-label text-right px-4 py-3">Amount</th>
                  <th className="text-label text-right px-4 py-3">Fees</th>
                  <th className="text-label text-right px-5 py-3">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50/60 transition-avenzo">
                    <td className="px-5 py-3.5 text-charcoal-700 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-charcoal-500">{t.order.slice(0, 8)}</td>
                    <td className="px-4 py-3.5">
                      <Badge color={TYPE_BADGE_COLOR[t.type] || 'gray'}>{t.type}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-charcoal-700 truncate max-w-xs">{t.description}</td>
                    <td className="px-4 py-3.5 text-right text-charcoal-900">
                      {t.amount > 0
                        ? '$' + Number(t.amount).toFixed(2)
                        : t.amount < 0
                        ? '-$' + Math.abs(Number(t.amount)).toFixed(2)
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right text-error-700">
                      {t.fees > 0 ? '-$' + Number(t.fees).toFixed(2) : '—'}
                    </td>
                    <td
                      className={
                        'px-5 py-3.5 text-right font-medium ' +
                        (t.net < 0 ? 'text-error-700' : 'text-charcoal-900')
                      }
                    >
                      {t.net < 0 ? '-$' + Math.abs(Number(t.net)).toFixed(2) : '$' + Number(t.net).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-caption text-center pt-4 border-t border-stone-200">
        All payouts, fees, and balances shown here are <strong className="font-medium text-charcoal-700">simulated</strong>. No real
        money moves in this demo.
      </p>
    </div>
  )
}
