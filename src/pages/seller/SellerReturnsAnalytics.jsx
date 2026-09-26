import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
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
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import SellerStatCard from '../../components/seller/SellerStatCard'
import Card from '../../components/Card'
import Button from '../../components/Button'

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
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'returns-analytics-' + new Date().toISOString().slice(0, 10) + '.csv'
      a.click()
      URL.revokeObjectURL(url)
      pushToast('Returns report downloaded', { type: 'success' })
    } catch {
      pushToast('Could not generate report', { type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl animate-fade-in">
        <div className="h-14 rounded-xl skeleton-shimmer" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
        <div className="h-56 rounded-xl skeleton-shimmer" />
      </div>
    )
  }
  if (!data) return null

  const maxMonth = Math.max(...data.months.map((m) => m.count), 1)

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <SellerPageHeader
        backTo="/seller/orders/returns"
        title="Return Analytics"
        description="Return rate, refund exposure, and product-level insights."
        actions={
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Download Report
          </Button>
        }
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SellerStatCard label="Total Returns" value={data.totalReturns} icon={RotateCcw} />
        <SellerStatCard label="Total Refunded" value={'$' + data.refundTotal.toLocaleString()} icon={DollarSign} invert />
        <SellerStatCard label="Avg Return Value" value={'$' + data.avgReturnValue.toFixed(2)} icon={TrendingUp} />
        <SellerStatCard label="Top Reason" value={data.topReason} icon={AlertTriangle} />
      </div>

      {/* Returns over time */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-charcoal-500" /> Returns Over Time
          </span>
        }
      >
        <div className="flex items-end justify-between gap-3 h-40">
          {data.months.map((m) => {
            const height = (m.count / maxMonth) * 100
            return (
              <div key={m.key} className="flex flex-col items-center flex-1 group">
                <div className="text-xs font-medium text-charcoal-700 mb-1">{m.count}</div>
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full max-w-[36px] mx-auto bg-brass-400 group-hover:bg-brass-500 rounded-t-md transition-avenzo"
                    style={{ height: Math.max(4, height) + '%' }}
                  />
                </div>
                <div className="text-caption mt-2">{m.label}</div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Reason breakdown */}
      <Card title="Return Reasons">
        {data.reasonBreakdown.length === 0 ? (
          <p className="text-body-sm">No returns to analyze yet.</p>
        ) : (
          <div className="space-y-3">
            {data.reasonBreakdown.map((r) => (
              <div key={r.reason}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-charcoal-700">{r.reason}</span>
                  <span className="text-charcoal-900 font-medium">
                    {r.percent.toFixed(0)}% · {r.count}
                  </span>
                </div>
                <div className="bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-brass-400 rounded-full" style={{ width: r.percent + '%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Top products */}
      <Card
        padding="none"
        title={
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4 text-charcoal-500" /> Products With Highest Return Rate
          </span>
        }
      >
        {data.topProducts.length === 0 ? (
          <div className="p-10 text-center text-body-sm">No product return data yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-6 py-3 text-label">Product</th>
                  <th className="text-right px-4 py-3 text-label">Returns</th>
                  <th className="text-right px-4 py-3 text-label">Units Sold</th>
                  <th className="text-right px-4 py-3 text-label">Return Rate</th>
                  <th className="text-right px-6 py-3 text-label">Refund Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.topProducts.map((p) => (
                  <tr key={p.product_id || p.product_title} className="hover:bg-stone-50/60 transition-avenzo">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.product_image ? (
                          <img src={p.product_image} alt="" className="w-9 h-9 rounded-md object-cover border border-stone-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-stone-100" />
                        )}
                        <div className="font-medium text-charcoal-900 truncate max-w-xs">{p.product_title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-charcoal-700">{p.count}</td>
                    <td className="px-4 py-3.5 text-right text-charcoal-700">{p.sold}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={
                          'font-medium ' +
                          (p.returnRate > 10 ? 'text-error-700' : p.returnRate > 5 ? 'text-warning-700' : 'text-success-700')
                        }
                      >
                        {p.returnRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-charcoal-900">${p.refundTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Link to Growth */}
      <div className="bg-info-50 border border-info-500/25 rounded-xl p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-info-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-info-700">High return rate = growth opportunity</div>
          <p className="text-sm text-info-700/90 mt-1">
            Products with high return rates are flagged automatically on your Growth page as opportunities to
            improve listing quality or address quality issues.
          </p>
        </div>
        <Link to="/seller/growth" className="text-sm font-medium text-info-700 hover:underline flex-shrink-0">
          View Growth →
        </Link>
      </div>
    </div>
  )
}
