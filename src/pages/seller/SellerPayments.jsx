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

const TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'sale', label: 'Sales' },
  { id: 'fee', label: 'Fees' },
  { id: 'refund', label: 'Refunds' },
]

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
    } catch (err) {
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
    return <div className="text-sm text-gray-600">Loading payments…</div>
  }
  if (!data) return null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-600">
            Your balance, next payout, and transaction history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={load}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top balance cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#febd69] bg-orange-50 p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c7511f] mb-2">
            <Wallet className="w-4 h-4" /> Available balance
          </div>
          <div className="text-4xl font-bold text-[#c7511f]">
            ${data.availableBalance.toFixed(2)}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Ready to pay out. Updates as orders complete.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-2">
            <Clock className="w-4 h-4" /> Next payout
          </div>
          <div className="text-4xl font-bold text-gray-900">
            ${data.nextPayout.toFixed(2)}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Scheduled in 14 days from each order date.
          </p>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryTile
          label="Total sales"
          value={'$' + data.gross.toFixed(2)}
          icon={TrendingUp}
        />
        <SummaryTile
          label={`Amazon fees (${data.feeRate}%)`}
          value={'-$' + data.fees.toFixed(2)}
          icon={DollarSign}
          tone="red"
        />
        <SummaryTile
          label="Refunds"
          value={'-$' + data.refunds.toFixed(2)}
          icon={TrendingDown}
          tone="red"
        />
        <SummaryTile
          label="Net proceeds"
          value={'$' + data.netProceeds.toFixed(2)}
          icon={Wallet}
          tone="green"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={
                'px-3 py-1.5 rounded-full border text-sm transition ' +
                (typeFilter === f.id
                  ? 'bg-[#232f3e] text-white border-[#232f3e]'
                  : 'border-gray-300 hover:border-gray-500')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-1.5 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order ID or description..."
            className="flex-1 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">
              No transactions
            </h3>
            <p className="text-sm text-gray-600">
              Transactions will appear here as customers purchase your products.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Description</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-right px-4 py-3">Fees</th>
                  <th className="text-right px-5 py-3">Net</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {t.order.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-block text-xs font-medium px-2 py-0.5 rounded-full ' +
                          (t.type === 'Sale'
                            ? 'bg-green-100 text-green-800'
                            : t.type === 'Fee'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-800')
                        }
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 truncate max-w-xs">
                      {t.description}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {t.amount > 0
                        ? '$' + Number(t.amount).toFixed(2)
                        : t.amount < 0
                        ? '-$' + Math.abs(Number(t.amount)).toFixed(2)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-red-700">
                      {t.fees > 0 ? '-$' + Number(t.fees).toFixed(2) : '—'}
                    </td>
                    <td
                      className={
                        'px-5 py-3 text-right font-medium ' +
                        (t.net < 0 ? 'text-red-700' : 'text-gray-900')
                      }
                    >
                      {t.net < 0
                        ? '-$' + Math.abs(Number(t.net)).toFixed(2)
                        : '$' + Number(t.net).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center pt-4 border-t">
        All payouts, fees, and balances shown here are <strong>simulated</strong>. No real
        money moves in this demo.
      </p>
    </div>
  )
}

function SummaryTile({ label, value, icon: Icon, tone }) {
  const toneCls =
    tone === 'red'
      ? 'text-red-700'
      : tone === 'green'
      ? 'text-green-700'
      : 'text-gray-900'
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-gray-500">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className={'text-2xl font-bold ' + toneCls}>{value}</div>
    </div>
  )
}