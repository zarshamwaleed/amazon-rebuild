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
  Megaphone,
  RotateCcw,
  Box,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerReport } from '../../services/sellerService'
import MiniSalesChart from '../../components/seller/MiniSalesChart'

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
      } catch (err) {
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
    return report.series.map((d) => ({
      label: d.label,
      value: d.sales,
    }))
  }, [report])

  const ordersChartData = useMemo(() => {
    if (!report?.series) return []
    return report.series.map((d) => ({
      label: d.label,
      value: d.orders,
    }))
  }, [report])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Reports</h1>
          <p className="text-sm text-gray-600">
            Sales, traffic, inventory, and payment insights for your store.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={!report}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setRange({ ...range })}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 flex-wrap">
          {RANGE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={
                'px-3 py-1.5 rounded-full border text-sm transition ' +
                (preset === p.id
                  ? 'bg-[#232f3e] text-white border-[#232f3e]'
                  : 'border-gray-300 hover:border-gray-500')
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
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <button
              onClick={applyCustom}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-1.5 rounded text-sm"
            >
              Apply
            </button>
          </div>
        )}

        <div className="text-xs text-gray-500 ml-auto">
          {range.from.toLocaleDateString()} – {range.to.toLocaleDateString()}
        </div>
      </div>

      {/* KPI row */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-600">
          Loading report…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <KPI label="Sales" value={'$' + report.kpis.sales.toFixed(2)} icon={DollarSign} accent />
            <KPI label="Orders" value={report.kpis.orders} icon={ShoppingCart} />
            <KPI label="Units" value={report.kpis.units} icon={Package} />
            <KPI label="Sessions" value={report.kpis.sessions.toLocaleString()} icon={Users} />
            <KPI label="Conv. Rate" value={report.kpis.conversionRate + '%'} icon={Percent} />
            <KPI label="AOV" value={'$' + report.kpis.aov.toFixed(2)} icon={TrendingUp} />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition ' +
                  (tab === t.id
                    ? 'border-[#c7511f] text-[#c7511f]'
                    : 'border-transparent text-gray-600 hover:text-gray-900')
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'sales' && (
            <div className="space-y-5">
              <ChartCard title="Sales over time">
                <MiniSalesChart data={chartData} />
              </ChartCard>
              <ChartCard title="Orders over time">
                <MiniSalesChart data={ordersChartData} />
              </ChartCard>
            </div>
          )}

          {tab === 'traffic' && (
            <div className="grid sm:grid-cols-3 gap-4">
              <Tile label="Sessions" value={report.traffic.sessions.toLocaleString()} />
              <Tile label="Page views" value={report.traffic.pageViews.toLocaleString()} />
              <Tile label="Conversion rate" value={report.traffic.conversionRate + '%'} />
            </div>
          )}

          {tab === 'inventory' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Tile label="Total SKUs" value={report.inventory.totalSkus} icon={Box} />
              <Tile label="Units in stock" value={report.inventory.totalUnits.toLocaleString()} icon={Package} />
              <Tile label="Inventory value" value={'$' + report.inventory.inventoryValue.toFixed(2)} icon={DollarSign} />
              <Tile label="Low stock" value={report.inventory.lowStock} tone="amber" />
              <Tile label="Out of stock" value={report.inventory.outOfStock} tone="red" />
            </div>
          )}

          {tab === 'returns' && (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <RotateCcw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">No returns in this period</h3>
              <p className="text-sm text-gray-600">
                Returns processing is coming soon.
              </p>
            </div>
          )}

          {tab === 'advertising' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Tile label="Impressions" value={report.advertising.impressions.toLocaleString()} />
              <Tile label="Clicks" value={report.advertising.clicks.toLocaleString()} />
              <Tile label="Ad spend" value={'$' + report.advertising.spend.toFixed(2)} />
              <Tile
                label="Ad sales"
                value={'$' + report.advertising.sales.toFixed(2)}
                tone={report.advertising.roas >= 3 ? 'green' : undefined}
              />
            </div>
          )}

          {tab === 'payments' && (
            <div className="grid sm:grid-cols-3 gap-4">
              <Tile label="Gross sales" value={'$' + report.payments.gross.toFixed(2)} />
              <Tile label={`Platform fee (${report.payments.feeRate}%)`} value={'-$' + report.payments.fees.toFixed(2)} tone="red" />
              <Tile label="Net proceeds" value={'$' + report.payments.net.toFixed(2)} tone="green" icon={DollarSign} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function KPI({ label, value, icon: Icon, accent }) {
  return (
    <div
      className={
        'rounded-lg border p-4 ' +
        (accent ? 'border-[#febd69] bg-orange-50' : 'border-gray-200 bg-white')
      }
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div
        className={
          'text-2xl font-bold ' + (accent ? 'text-[#c7511f]' : 'text-gray-900')
        }
      >
        {value}
      </div>
    </div>
  )
}

function Tile({ label, value, tone, icon: Icon }) {
  const toneCls =
    tone === 'red'
      ? 'text-red-700'
      : tone === 'green'
      ? 'text-green-700'
      : tone === 'amber'
      ? 'text-amber-700'
      : 'text-gray-900'
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className={'text-2xl font-bold ' + toneCls}>{value}</div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  )
}