import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Rocket,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Eye,
  ShoppingCart,
  Users,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Package,
  Megaphone,
  Sparkles,
  Star,
  Percent,
  Award,
  Zap,
  Shield,
  Store,
  Target,
  Gauge,
  BookOpen,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getSellerGrowth,
  syncGrowthOpportunities,
  getGrowthStatuses,
  updateOpportunityStatus,
} from '../../services/sellerService'

const OPPORTUNITY_TABS = [
  { id: 'All', label: 'All' },
  { id: 'Sell New Products', label: 'Sell New Products' },
  { id: 'Improve Sales', label: 'Improve Sales' },
  { id: 'Reduce Cost', label: 'Reduce Cost' },
  { id: 'Drive Traffic', label: 'Drive Traffic' },
]

const GROWTH_PROGRAMS = [
  { name: 'A+ Content', description: 'Improve product detail pages', icon: Package, color: 'from-blue-500 to-indigo-600' },
  { name: 'Vine', description: 'Get eligible products in front of reviewers', icon: Star, color: 'from-emerald-500 to-teal-600' },
  { name: 'Sponsored Products', description: 'Increase product visibility', icon: Megaphone, color: 'from-amber-500 to-orange-600' },
  { name: 'Brand Registry', description: 'Build and protect your brand', icon: Shield, color: 'from-slate-600 to-slate-800' },
  { name: 'Subscribe & Save', description: 'Encourage repeat purchases', icon: Zap, color: 'from-fuchsia-500 to-purple-600' },
  { name: 'Brand Analytics', description: 'Understand customer behavior', icon: BarChart3, color: 'from-cyan-500 to-blue-600' },
]

const IMPACT_STYLES = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-gray-100 text-gray-700',
}

export default function SellerGrowth() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState({})
  const [drawer, setDrawer] = useState(null)
  const [tab, setTab] = useState('All')
  const [query, setQuery] = useState('')
  const [range, setRange] = useState('30d')

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const d = await getSellerGrowth(user.id)
      setData(d)
      // Sync opportunities to DB, then load persisted statuses
      await syncGrowthOpportunities(user.id, d.opportunities)
      const st = await getGrowthStatuses(user.id)
      setStatuses(st)
    } catch (err) {
      pushToast('Could not load growth data', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const filteredOpportunities = useMemo(() => {
    if (!data) return []
    let list = data.opportunities.filter((o) => {
      const st = statuses[o.id]
      return !st || st.status !== 'dismissed'
    })
    if (tab !== 'All') list = list.filter((o) => o.category === tab)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (o) =>
          o.productTitle.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [data, tab, query, statuses])

  function handleDownload() {
    if (!data) return
    const rows = [
      ['Product', 'Opportunity', 'Category', 'Impact', 'Estimated Value', 'Recommended Action'],
      ...data.opportunities.map((o) => [
        o.productTitle,
        o.title,
        o.category,
        o.impact,
        o.estimatedValue,
        o.recommendedAction,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'growth-opportunities-' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)
    pushToast('Growth report downloaded', { type: 'success' })
  }

  function handleAction(opp) {
    if (opp.actionLink) {
      window.location.href = opp.actionLink
    } else {
      pushToast(opp.recommendedAction + ' — coming soon', { type: 'info' })
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Analyzing your business…</div>
  }
  if (!data) return null

  const m = data.metrics
  const s = data.summary

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white rounded-lg p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Rocket className="w-7 h-7 text-[#febd69]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Grow Your Business</h1>
              <p className="text-gray-200 text-sm mt-1">
                Discover opportunities to increase sales, improve performance, and reduce costs.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded flex items-center gap-2 text-sm transition"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-stretch bg-white rounded overflow-hidden flex-1 max-w-xl">
            <span className="flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search opportunities..."
              className="flex-1 px-3 py-2 text-sm text-gray-900 focus:outline-none"
            />
          </div>
          <span className="text-xs text-gray-300">Last updated: Today</span>
        </div>
      </div>

      {/* Growth Overview */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Growth Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewTile
            label="Opportunities found"
            value={s.total}
            icon={Lightbulb}
            tone="blue"
          />
          <OverviewTile
            label="Potential sales impact"
            value={'$' + s.potentialImpact.toLocaleString()}
            sub="estimated"
            icon={DollarSign}
            tone="green"
          />
          <OverviewTile
            label="Products needing action"
            value={s.productsNeedingAction}
            icon={Package}
            tone="amber"
          />
          <OverviewTile
            label="High-priority opportunities"
            value={s.highPriority}
            icon={AlertTriangle}
            tone="red"
          />
        </div>
      </section>

      {/* Growth Metrics */}
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-gray-900">Growth Metrics</h2>
          <div className="flex gap-1 text-xs">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={
                  'px-3 py-1 rounded transition ' +
                  (range === r.id
                    ? 'bg-[#232f3e] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard label="Sales" value={'$' + m.sales.toLocaleString()} icon={DollarSign} trendUp />
          <MetricCard label="Orders" value={m.orders} icon={ShoppingCart} trendUp />
          <MetricCard label="Units Sold" value={m.units} icon={Package} trendUp />
          <MetricCard label="Sessions" value={m.sessions.toLocaleString()} icon={Users} trendUp />
          <MetricCard label="Conversion" value={m.conversion.toFixed(2) + '%'} icon={Percent} />
        </div>
      </section>

      {/* Top Opportunities */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Top Opportunities</h2>
          <span className="text-sm text-gray-500">
            {filteredOpportunities.length} opportunit
            {filteredOpportunities.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b overflow-x-auto no-scrollbar mb-4">
          {OPPORTUNITY_TABS.map((t) => (
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

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {filteredOpportunities.length === 0 ? (
            <div className="p-12 text-center">
              <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                No opportunities in this view
              </h3>
              <p className="text-sm text-gray-600">
                Try a different category or clear the search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="text-left px-5 py-3">Product</th>
                    <th className="text-left px-4 py-3">Action</th>
                    <th className="text-center px-4 py-3">Impact</th>
                    <th className="text-right px-4 py-3">Est. value</th>
                    <th className="text-right px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpportunities.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => setDrawer(o)}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {o.productImage ? (
                            <img
                              src={o.productImage}
                              alt=""
                              className="w-9 h-9 rounded object-cover border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[240px]">
                              {o.productTitle}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              {o.category}
                              {(() => {
                                const st = statuses[o.id]?.status
                                if (!st || st === 'new') return null
                                const meta = {
                                  in_progress: { label: 'In progress', cls: 'bg-amber-100 text-amber-800' },
                                  completed: { label: 'Completed', cls: 'bg-green-100 text-green-800' },
                                }[st]
                                if (!meta) return null
                                return (
                                  <span className={'text-[10px] font-medium px-1.5 py-0.5 rounded-full ' + meta.cls}>
                                    {meta.label}
                                  </span>
                                )
                              })()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 text-sm font-medium">{o.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-0.5">
                          {o.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            'inline-block text-xs font-medium px-2 py-0.5 rounded-full ' +
                            IMPACT_STYLES[o.impact]
                          }
                        >
                          {o.impact}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        ${Math.round(o.estimatedValue).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAction(o)
                          }}
                          className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline font-medium whitespace-nowrap"
                        >
                          {o.recommendedAction} →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Product Performance */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Product Performance</h2>
          <Link
            to="/seller/products"
            className="text-sm text-[#007185] hover:underline"
          >
            View all products →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {data.topProducts.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-600">
              No product data yet. Add products to see performance.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="text-left px-5 py-3">Product</th>
                    <th className="text-right px-4 py-3">Views</th>
                    <th className="text-right px-4 py-3">Units</th>
                    <th className="text-right px-4 py-3">Conversion</th>
                    <th className="text-right px-4 py-3">Sales</th>
                    <th className="text-center px-4 py-3">Status</th>
                    <th className="text-right px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((row) => {
                    const p = row.product
                    const status = computeStatus(row)
                    return (
                      <tr key={p.id} className="border-t hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt=""
                                className="w-9 h-9 rounded object-cover border"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate max-w-[200px]">
                                {p.title}
                              </div>
                              {p.stock === 0 && (
                                <div className="text-xs text-red-600">
                                  Out of stock
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {row.sessions.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {row.units}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {row.conversion.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          ${row.sales.toFixed(2)}
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
                        <td className="px-5 py-3 text-right">
                          <Link
                            to={`/seller/products/${p.id}/edit`}
                            className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Growth Programs */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Growth Programs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {GROWTH_PROGRAMS.map((prog) => {
            const Icon = prog.icon
            return (
              <button
                key={prog.name}
                onClick={() => pushToast(prog.name + ' — demo program', { type: 'info' })}
                className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md hover:border-gray-400 transition flex flex-col"
              >
                <div
                  className={
                    'w-10 h-10 rounded-lg bg-gradient-to-br ' +
                    prog.color +
                    ' flex items-center justify-center mb-3'
                  }
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-bold text-gray-900 leading-snug">
                  {prog.name}
                </div>
                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {prog.description}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recommended for You */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.opportunities.slice(0, 3).map((o) => (
            <button
              key={o.id}
              onClick={() => handleAction(o)}
              className="bg-white border border-gray-200 rounded-lg p-5 text-left hover:shadow-md hover:border-gray-400 transition flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#c7511f]" />
                <span className="text-xs uppercase tracking-wider text-gray-500">
                  {o.category}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{o.title}</h3>
              <div className="text-xs text-gray-500 mb-3 line-clamp-1">
                {o.productTitle}
              </div>
              <p className="text-sm text-gray-700 line-clamp-2 flex-1 mb-3">
                {o.description}
              </p>
              <span className="text-sm font-medium text-[#007185] flex items-center gap-1">
                {o.recommendedAction} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {drawer && (
        <OpportunityDrawer
          opp={drawer}
          status={statuses[drawer.id]?.status || 'new'}
          onClose={() => setDrawer(null)}
          onAction={async () => {
            // Mark in-progress on take action
            if ((statuses[drawer.id]?.status || 'new') === 'new') {
              await updateOpportunityStatus(user.id, drawer.id, 'in_progress')
            }
            handleAction(drawer)
          }}
          onStatusChange={async (next) => {
            await updateOpportunityStatus(user.id, drawer.id, next)
            pushToast('Status updated', { type: 'success' })
            setDrawer(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function computeStatus(row) {
  if (row.product.stock === 0) return { label: 'Out of stock', cls: 'bg-red-100 text-red-800' }
  if (row.conversion >= 4) return { label: 'Strong', cls: 'bg-green-100 text-green-800' }
  if (row.conversion >= 2) return { label: 'Good', cls: 'bg-blue-100 text-blue-800' }
  if (row.units > 0) return { label: 'Improve', cls: 'bg-amber-100 text-amber-800' }
  return { label: 'No sales', cls: 'bg-gray-100 text-gray-600' }
}

function OverviewTile({ label, value, sub, icon: Icon, tone }) {
  const toneCls = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    green: 'border-green-200 bg-green-50 text-green-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    red: 'border-red-200 bg-red-50 text-red-900',
  }[tone] || 'border-gray-200 bg-white text-gray-900'

  return (
    <div className={'border rounded-lg p-5 ' + toneCls}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider opacity-70">{label}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="text-2xl md:text-3xl font-bold">{value}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, trendUp }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      {trendUp && (
        <div className="text-xs text-green-700 mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Tracked last 30 days
        </div>
      )}
    </div>
  )
}

function OpportunityDrawer({ opp, status, onClose, onAction, onStatusChange }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#febd69]" />
            <span className="font-bold">Opportunity</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
              {opp.category}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{opp.title}</h2>
            {opp.productTitle && (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                {opp.productImage && (
                  <img
                    src={opp.productImage}
                    alt=""
                    className="w-5 h-5 rounded object-cover border"
                  />
                )}
                {opp.productTitle}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">{opp.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                Impact
              </div>
              <div className="font-bold text-gray-900">{opp.impact}</div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                Est. lift
              </div>
              <div className="font-bold text-gray-900">
                ${Math.round(Number(opp.estimatedValue || 0)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-4 flex flex-col gap-2">
          {status === 'completed' ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded p-3 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Marked complete
            </div>
          ) : (
            <>
              <button
                onClick={onAction}
                className="w-full bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium py-2.5 rounded transition"
              >
                Take Action — {opp.recommendedAction}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => onStatusChange('dismissed')}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 rounded text-sm"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => onStatusChange('completed')}
                  className="flex-1 border border-green-300 text-green-700 hover:bg-green-50 py-2 rounded text-sm"
                >
                  Mark Complete
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}