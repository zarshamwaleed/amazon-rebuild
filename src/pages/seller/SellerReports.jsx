import { useEffect, useMemo, useState } from 'react'
import {
  RefreshCw,
  Download,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  Percent,
  DollarSign,
  RotateCcw,
  Box,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerReport } from '../../services/sellerService'
import MiniSalesChart from '../../components/seller/MiniSalesChart'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import SellerStatCard from '../../components/seller/SellerStatCard'
import Card from '../../components/Card'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'

const RANGE_PRESETS = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: '7 Days', days: 7 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
  { id: 'custom', label: 'Custom', days: null },
]

const TABS = [
  { id: 'sales', label: 'Sales' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'returns', label: 'Returns' },
  { id: 'advertising', label: 'Advertising' },
  { id: 'payments', label: 'Payments' },
]

function presetRange(preset) {
  const to = new Date()
  const from = new Date()
  if (preset === 'today') {
    from.setHours(0, 0, 0, 0)
  } else {
    const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90
    from.setDate(from.getDate() - (days - 1))
    from.setHours(0, 0, 0, 0)
  }
  return { from, to }
}

export default function SellerReports() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [preset, setPreset] = useState('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('sales')

  const [range, setRange] = useState(() => presetRange('30d'))

  useEffect(() => {
    if (preset === 'custom') return
    setRange(presetRange(preset))
  }, [preset])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const r = await getSellerReport(user.id, range.from, range.to)
        if (!cancelled) setReport(r)
      } catch {
        if (!cancelled) pushToast('Could not load report', { type: 'error' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user, range])

  function applyCustom() {
    if (!customFrom || !customTo) {
      return pushToast('Pick both a start and end date', { type: 'error' })
    }
    if (new Date(customFrom) > new Date(customTo)) {
      return pushToast('Start must be before end', { type: 'error' })
    }
    setRange({ from: new Date(customFrom), to: new Date(customTo) })
  }

  function exportCsv() {
    if (!report) return
    const rows = [
      ['Metric', 'Value'],
      ['Sales', report.kpis.sales],
      ['Orders', report.kpis.orders],
      ['Units', report.kpis.units],
      ['Sessions', report.kpis.sessions],
      ['Conversion Rate', report.kpis.conversionRate + '%'],
      ['AOV', report.kpis.aov],
      [],
      ['Date', 'Sales', 'Orders', 'Units', 'Sessions'],
      ...report.series.map((d) => [d.fullDate, d.sales, d.orders, d.units, d.sessions]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'seller-report-' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)
    pushToast('Report downloaded', { type: 'success' })
  }

  const chartData = useMemo(() => {
    if (!report?.series) return []
    return report.series.map((d) => ({ label: d.label, value: d.sales }))
  }, [report])

  const ordersChartData = useMemo(() => {
    if (!report?.series) return []
    return report.series.map((d) => ({ label: d.label, value: d.orders }))
  }, [report])

  return (
    <div className="space-y-6">
      <SellerPageHeader
        title="Business Reports"
        description="Sales, traffic, inventory, and payment insights for your store."
        actions={
          <>
            <Button variant="outline" size="md" onClick={exportCsv} disabled={!report}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button variant="outline" size="md" onClick={() => setRange({ ...range })} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        }
      />

      {/* Date filters */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 flex-wrap">
          {RANGE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={
                'px-3 py-1.5 rounded-full border text-sm font-medium transition-avenzo ' +
                (preset === p.id
                  ? 'bg-charcoal-900 text-bone-50 border-charcoal-900'
                  : 'border-stone-300 text-charcoal-600 hover:border-stone-400 hover:text-charcoal-900')
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm bg-bone-50 text-charcoal-900 focus:outline-none focus:border-brass-400 transition-avenzo"
            />
            <span className="text-charcoal-400 text-sm">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm bg-bone-50 text-charcoal-900 focus:outline-none focus:border-brass-400 transition-avenzo"
            />
            <Button variant="secondary" size="sm" onClick={applyCustom}>
              Apply
            </Button>
          </div>
        )}

        <div className="text-caption ml-auto whitespace-nowrap">
          {range.from.toLocaleDateString()} – {range.to.toLocaleDateString()}
        </div>
      </div>

      {/* KPI row */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <SellerStatCard label="Sales" value={'$' + report.kpis.sales.toFixed(2)} icon={DollarSign} />
            <SellerStatCard label="Orders" value={report.kpis.orders} icon={ShoppingCart} />
            <SellerStatCard label="Units" value={report.kpis.units} icon={Package} />
            <SellerStatCard label="Sessions" value={report.kpis.sessions.toLocaleString()} icon={Users} />
            <SellerStatCard label="Conv. Rate" value={report.kpis.conversionRate + '%'} icon={Percent} />
            <SellerStatCard label="AOV" value={'$' + report.kpis.aov.toFixed(2)} icon={TrendingUp} />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-avenzo ' +
                  (tab === t.id
                    ? 'border-brass-500 text-charcoal-900'
                    : 'border-transparent text-charcoal-500 hover:text-charcoal-800')
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'sales' && (
            <div className="space-y-5">
              <Card title="Sales over time">
                <MiniSalesChart data={chartData} />
              </Card>
              <Card title="Orders over time">
                <MiniSalesChart data={ordersChartData} formatValue={(v) => Math.round(v) + ' orders'} />
              </Card>
            </div>
          )}

          {tab === 'traffic' && (
            <div className="grid sm:grid-cols-3 gap-4">
              <Tile label="Sessions" value={report.traffic.sessions.toLocaleString()} icon={Users} />
              <Tile label="Page views" value={report.traffic.pageViews.toLocaleString()} />
              <Tile label="Conversion rate" value={report.traffic.conversionRate + '%'} icon={Percent} />
            </div>
          )}

          {tab === 'inventory' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Tile label="Total SKUs" value={report.inventory.totalSkus} icon={Box} />
              <Tile label="Units in stock" value={report.inventory.totalUnits.toLocaleString()} icon={Package} />
              <Tile label="Inventory value" value={'$' + report.inventory.inventoryValue.toFixed(2)} icon={DollarSign} />
              <Tile label="Low stock" value={report.inventory.lowStock} tone="warning" />
              <Tile label="Out of stock" value={report.inventory.outOfStock} tone="error" />
            </div>
          )}

          {tab === 'returns' && (
            <EmptyState
              icon={RotateCcw}
              title="No returns in this period"
              message="Returns processing is coming soon."
            />
          )}

          {tab === 'advertising' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Tile label="Impressions" value={report.advertising.impressions.toLocaleString()} />
              <Tile label="Clicks" value={report.advertising.clicks.toLocaleString()} />
              <Tile label="Ad spend" value={'$' + report.advertising.spend.toFixed(2)} />
              <Tile
                label="Ad sales"
                value={'$' + report.advertising.sales.toFixed(2)}
                tone={report.advertising.roas >= 3 ? 'success' : undefined}
              />
            </div>
          )}

          {tab === 'payments' && (
            <div className="grid sm:grid-cols-3 gap-4">
              <Tile label="Gross sales" value={'$' + report.payments.gross.toFixed(2)} />
              <Tile label={`Platform fee (${report.payments.feeRate}%)`} value={'-$' + report.payments.fees.toFixed(2)} tone="error" />
              <Tile label="Net proceeds" value={'$' + report.payments.net.toFixed(2)} tone="success" icon={DollarSign} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Tile({ label, value, tone, icon }) {
  const Icon = icon
  const toneCls =
    tone === 'error'
      ? 'text-error-700'
      : tone === 'success'
      ? 'text-success-700'
      : tone === 'warning'
      ? 'text-warning-700'
      : 'text-charcoal-900'
  return (
    <div className="rounded-xl border border-stone-200 bg-bone-50 shadow-subtle p-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-label">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-charcoal-400" />}
      </div>
      <div className={'font-display text-2xl ' + toneCls}>{value}</div>
    </div>
  )
}
