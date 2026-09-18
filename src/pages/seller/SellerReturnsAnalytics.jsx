import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  RotateCcw,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Package,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getReturnsAnalytics, getSellerReturns } from '../../services/sellerService'

export default function SellerReturnsAnalytics() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    getReturnsAnalytics(user.id)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch(() => pushToast('Could not load analytics', { type: 'error' }))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  async function handleDownload() {
    if (!user) return
    try {
      const returns = await getSellerReturns(user.id)
      const rows = [
        [
          'Return ID',
          'RMA',
          'Order ID',
          'Product',
          'SKU',
          'Reason',
          'Status',
          'Refund Status',
          'Refund Amount',
          'Requested',
        ],
        ...returns.map((r) => [
          r.id,
          r.rma || '',
          r.order_id || '',
          r.product_title || '',
          r.product_sku || '',
          r.return_reason || '',
          r.status || '',
          r.refund_status || '',
          r.refund_amount || 0,
          r.requested_at ? new Date(r.requested_at).toISOString().slice(0, 10) : '',
        ]),
      ]
      const csv = rows
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'returns-analytics-' + new Date().toISOString().slice(0, 10) + '.csv'
      a.click()
      URL.revokeObjectURL(url)
      pushToast('Returns report downloaded', { type: 'success' })
    } catch (err) {
      pushToast('Could not generate report', { type: 'error' })
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Loading analytics…</div>
  }
  if (!data) return null

  const maxMonth = Math.max(...data.months.map((m) => m.count), 1)

  return (
    <div className="space-y-6 max-w-6xl">
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
          <h1 className="text-2xl font-bold text-gray-900">Return Analytics</h1>
          <p className="text-sm text-gray-600">
            Return rate, refund exposure, and product-level insights.
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          label="Total Returns"
          value={data.totalReturns}
          icon={RotateCcw}
          tone="blue"
        />
        <KpiTile
          label="Total Refunded"
          value={'$' + data.refundTotal.toLocaleString()}
          icon={DollarSign}
          tone="red"
        />
        <KpiTile
          label="Avg Return Value"
          value={'$' + data.avgReturnValue.toFixed(2)}
          icon={TrendingUp}
          tone="amber"
        />
        <KpiTile
          label="Top Reason"
          value={data.topReason}
          icon={AlertTriangle}
          tone="purple"
          small
        />
      </div>

      {/* Returns over time */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Returns Over Time
        </h2>
        <div className="flex items-end justify-between gap-3 h-40">
          {data.months.map((m) => {
            const height = (m.count / maxMonth) * 100
            return (
              <div key={m.key} className="flex flex-col items-center flex-1">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {m.count}
                </div>
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-[#f3a847] to-[#febd69] rounded-t transition-all"
                    style={{ height: Math.max(4, height) + '%' }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">{m.label}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Reason breakdown */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-bold text-gray-900 mb-4">Return Reasons</h2>
        {data.reasonBreakdown.length === 0 ? (
          <p className="text-sm text-gray-500">No returns to analyze yet.</p>
        ) : (
          <div className="space-y-3">
            {data.reasonBreakdown.map((r) => (
              <div key={r.reason}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{r.reason}</span>
                  <span className="text-gray-900 font-medium">
                    {r.percent.toFixed(0)}% · {r.count}
                  </span>
                </div>
                <div className="bg-gray-100 rounded h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#f3a847] to-[#febd69]"
                    style={{ width: r.percent + '%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top products */}
      <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4" /> Products With Highest Return Rate
          </h2>
        </div>

        {data.topProducts.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No product return data yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-6 py-3">Product</th>
                  <th className="text-right px-4 py-3">Returns</th>
                  <th className="text-right px-4 py-3">Units Sold</th>
                  <th className="text-right px-4 py-3">Return Rate</th>
                  <th className="text-right px-6 py-3">Refund Total</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p) => (
                  <tr key={p.product_id || p.product_title} className="border-t">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {p.product_image ? (
                          <img
                            src={p.product_image}
                            alt=""
                            className="w-9 h-9 rounded object-cover border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-100" />
                        )}
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {p.product_title}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {p.count}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {p.sold}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          'font-medium ' +
                          (p.returnRate > 10
                            ? 'text-red-700'
                            : p.returnRate > 5
                            ? 'text-amber-700'
                            : 'text-green-700')
                        }
                      >
                        {p.returnRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900">
                      ${p.refundTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Link to Growth */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-bold text-blue-900">High return rate = growth opportunity</div>
          <p className="text-sm text-blue-800 mt-1">
            Products with high return rates are flagged automatically on your Growth page
            as opportunities to improve listing quality or address quality issues.
          </p>
        </div>
        <Link
          to="/seller/growth"
          className="text-sm font-medium text-blue-900 hover:underline flex-shrink-0"
        >
          View Growth →
        </Link>
      </div>
    </div>
  )
}

function KpiTile({ label, value, icon: Icon, tone, small }) {
  const toneCls = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    red: 'border-red-200 bg-red-50 text-red-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    purple: 'border-purple-200 bg-purple-50 text-purple-900',
  }[tone] || 'border-gray-200 bg-white text-gray-900'

  return (
    <div className={'border rounded-lg p-5 ' + toneCls}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider opacity-70">{label}</span>
        {Icon && <Icon className="w-4 h-4 opacity-60" />}
      </div>
      <div
        className={
          (small ? 'text-lg' : 'text-2xl md:text-3xl') + ' font-bold truncate'
        }
      >
        {value}
      </div>
    </div>
  )
}