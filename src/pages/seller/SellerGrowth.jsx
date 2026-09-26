import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AIGrowthAssistant from '../../components/seller/AIGrowthAssistant'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import SellerStatCard from '../../components/seller/SellerStatCard'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import {
  Download,
  Search,
  TrendingUp,
  DollarSign,
  BarChart3,
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
  Zap,
  Shield,
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
  { name: 'A+ Content', description: 'Improve product detail pages', icon: Package },
  { name: 'Vine', description: 'Get eligible products in front of reviewers', icon: Star },
  { name: 'Sponsored Products', description: 'Increase product visibility', icon: Megaphone },
  { name: 'Brand Registry', description: 'Build and protect your brand', icon: Shield },
  { name: 'Subscribe & Save', description: 'Encourage repeat purchases', icon: Zap },
  { name: 'Brand Analytics', description: 'Understand customer behavior', icon: BarChart3 },
]

const IMPACT_COLOR = { High: 'red', Medium: 'yellow', Low: 'gray' }

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
      console.error('[getSellerGrowth]', err)
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
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-40 rounded-xl skeleton-shimmer" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
        <div className="h-64 rounded-xl skeleton-shimmer" />
      </div>
    )
  }
  if (!data) return null

  const m = data.metrics
  const s = data.summary

  return (
    <div className="space-y-6">
      <SellerPageHeader
        title="Grow Your Business"
        description="Discover opportunities to increase sales, improve performance, and reduce costs."
        actions={
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Download Report
          </Button>
        }
      />

      {/* Search */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex flex-wrap items-center gap-3">
        <Search className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search opportunities..."
          className="flex-1 min-w-[200px] text-sm bg-transparent text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
        />
        <span className="text-xs text-charcoal-400 whitespace-nowrap">Last updated: Today</span>
      </div>

      {/* Growth Overview */}
      <section>
        <h2 className="heading-section mb-3">Growth Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SellerStatCard label="Opportunities found" value={s.total} icon={Lightbulb} />
          <SellerStatCard
            label="Potential sales impact"
            value={'$' + s.potentialImpact.toLocaleString()}
            icon={DollarSign}
          />
          <SellerStatCard label="Products needing action" value={s.productsNeedingAction} icon={Package} />
          <SellerStatCard label="High-priority opportunities" value={s.highPriority} icon={AlertTriangle} />
        </div>
      </section>

      {/* Growth Metrics */}
      <Card
        title="Growth Metrics"
        actions={
          <div className="flex gap-1 text-xs bg-stone-100 rounded-lg p-1">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={
                  'px-3 py-1.5 rounded-md font-medium transition-avenzo ' +
                  (range === r.id ? 'bg-bone-50 text-charcoal-900 shadow-subtle' : 'text-charcoal-500 hover:text-charcoal-800')
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard label="Sales" value={'$' + m.sales.toLocaleString()} icon={DollarSign} trendUp />
          <MetricCard label="Orders" value={m.orders} icon={ShoppingCart} trendUp />
          <MetricCard label="Units Sold" value={m.units} icon={Package} trendUp />
          <MetricCard label="Sessions" value={m.sessions.toLocaleString()} icon={Users} trendUp />
          <MetricCard label="Conversion" value={m.conversion.toFixed(2) + '%'} icon={Percent} />
        </div>
      </Card>

      {/* Top Opportunities */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="heading-section">Top Opportunities</h2>
          <span className="text-body-sm">
            {filteredOpportunities.length} opportunit
            {filteredOpportunities.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar mb-4">
          {OPPORTUNITY_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-avenzo ' +
                (tab === t.id ? 'border-brass-500 text-charcoal-900' : 'border-transparent text-charcoal-500 hover:text-charcoal-800')
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
          {filteredOpportunities.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title="No opportunities in this view"
              message="Try a different category or clear the search."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-label">Product</th>
                    <th className="text-left px-4 py-3 text-label">Action</th>
                    <th className="text-center px-4 py-3 text-label">Impact</th>
                    <th className="text-right px-4 py-3 text-label">Est. value</th>
                    <th className="text-right px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOpportunities.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => setDrawer(o)}
                      className="hover:bg-stone-50/60 transition-avenzo cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {o.productImage ? (
                            <img
                              src={o.productImage}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-charcoal-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-charcoal-900 truncate max-w-[240px]">
                              {o.productTitle}
                            </div>
                            <div className="text-xs text-charcoal-500 flex items-center gap-2">
                              {o.category}
                              {(() => {
                                const st = statuses[o.id]?.status
                                if (!st || st === 'new') return null
                                const meta = {
                                  in_progress: { label: 'In progress', color: 'yellow' },
                                  completed: { label: 'Completed', color: 'green' },
                                }[st]
                                if (!meta) return null
                                return <Badge color={meta.color}>{meta.label}</Badge>
                              })()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-charcoal-900 text-sm font-medium">{o.title}</div>
                        <div className="text-xs text-charcoal-500 line-clamp-1 max-w-xs mt-0.5">
                          {o.description}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge color={IMPACT_COLOR[o.impact]}>{o.impact}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right text-charcoal-700">
                        ${Math.round(o.estimatedValue).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAction(o)
                          }}
                          className="text-sm text-brass-600 hover:text-brass-700 font-medium whitespace-nowrap transition-avenzo"
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
          <h2 className="heading-section">Product Performance</h2>
          <Link to="/seller/products" className="text-sm text-brass-600 hover:text-brass-700 transition-avenzo">
            View all products →
          </Link>
        </div>

        <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
          {data.topProducts.length === 0 ? (
            <EmptyState icon={Package} title="No product data yet" message="Add products to see performance." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-label">Product</th>
                    <th className="text-right px-4 py-3 text-label">Views</th>
                    <th className="text-right px-4 py-3 text-label">Units</th>
                    <th className="text-right px-4 py-3 text-label">Conversion</th>
                    <th className="text-right px-4 py-3 text-label">Sales</th>
                    <th className="text-center px-4 py-3 text-label">Status</th>
                    <th className="text-right px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.topProducts.map((row) => {
                    const p = row.product
                    const status = computeStatus(row)
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/60 transition-avenzo">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {p.image_url ? (
                              <img src={p.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-stone-200" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
                                <Package className="w-4 h-4 text-charcoal-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-charcoal-900 truncate max-w-[200px]">{p.title}</div>
                              {p.stock === 0 && <div className="text-xs text-error-700">Out of stock</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right text-charcoal-700">{row.sessions.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right text-charcoal-700">{row.units}</td>
                        <td className="px-4 py-3.5 text-right text-charcoal-700">{row.conversion.toFixed(1)}%</td>
                        <td className="px-4 py-3.5 text-right font-medium text-charcoal-900">${row.sales.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <Badge color={status.color}>{status.label}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link to={`/seller/products/${p.id}/edit`} className="text-sm text-brass-600 hover:text-brass-700 transition-avenzo">
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
        <h2 className="heading-section mb-3">Growth Programs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {GROWTH_PROGRAMS.map((prog) => {
            const Icon = prog.icon
            return (
              <button
                key={prog.name}
                onClick={() => pushToast(prog.name + ' — demo program', { type: 'info' })}
                className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 text-left hover:shadow-soft hover:border-stone-300 transition-avenzo flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-brass-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-brass-600" />
                </div>
                <div className="text-sm font-semibold text-charcoal-900 leading-snug">{prog.name}</div>
                <div className="text-xs text-charcoal-500 mt-1 line-clamp-2">{prog.description}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recommended for You */}
      <section>
        <h2 className="heading-section mb-3">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.opportunities.slice(0, 3).map((o) => (
            <button
              key={o.id}
              onClick={() => handleAction(o)}
              className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-5 text-left hover:shadow-soft hover:border-stone-300 transition-avenzo flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-brass-500" />
                <span className="text-label">{o.category}</span>
              </div>
              <h3 className="font-semibold text-charcoal-900 text-sm mb-1">{o.title}</h3>
              <div className="text-xs text-charcoal-500 mb-3 line-clamp-1">{o.productTitle}</div>
              <p className="text-sm text-charcoal-700 line-clamp-2 flex-1 mb-3">{o.description}</p>
              <span className="text-sm font-medium text-brass-600 flex items-center gap-1">
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
      <AIGrowthAssistant growthData={data} />
    </div>
  )
}

function computeStatus(row) {
  if (row.product.stock === 0) return { label: 'Out of stock', color: 'red' }
  if (row.conversion >= 4) return { label: 'Strong', color: 'green' }
  if (row.conversion >= 2) return { label: 'Good', color: 'blue' }
  if (row.units > 0) return { label: 'Improve', color: 'yellow' }
  return { label: 'No sales', color: 'gray' }
}

function MetricCard({ label, value, icon, trendUp }) {
  const Icon = icon
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-label">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-charcoal-400" />}
      </div>
      <div className="text-xl font-semibold text-charcoal-900">{value}</div>
      {trendUp && (
        <div className="text-xs text-success-700 mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Tracked last 30 days
        </div>
      )}
    </div>
  )
}

function OpportunityDrawer({ opp, status, onClose, onAction, onStatusChange }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-charcoal-900/40 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />
      <aside className="w-full max-w-md bg-bone-50 shadow-lifted flex flex-col overflow-hidden animate-scale-in origin-right">
        <div className="bg-charcoal-900 text-bone-50 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-brass-300" />
            <span className="font-semibold">Opportunity</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-avenzo" aria-label="Close">
            ×
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <div className="text-label mb-1">{opp.category}</div>
            <h2 className="heading-sub mb-2">{opp.title}</h2>
            {opp.productTitle && (
              <div className="text-sm text-charcoal-600 flex items-center gap-2">
                {opp.productImage && (
                  <img src={opp.productImage} alt="" className="w-5 h-5 rounded object-cover border border-stone-200" />
                )}
                {opp.productTitle}
              </div>
            )}
          </div>

          <p className="text-sm text-charcoal-700 leading-relaxed">{opp.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-stone-200 rounded-lg p-3">
              <div className="text-label mb-1">Impact</div>
              <div className="font-semibold text-charcoal-900">{opp.impact}</div>
            </div>
            <div className="border border-stone-200 rounded-lg p-3">
              <div className="text-label mb-1">Est. lift</div>
              <div className="font-semibold text-charcoal-900">
                ${Math.round(Number(opp.estimatedValue || 0)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 p-4 flex flex-col gap-2 flex-shrink-0">
          {status === 'completed' ? (
            <div className="bg-success-50 border border-success-500/25 text-success-700 rounded-lg p-3 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Marked complete
            </div>
          ) : (
            <>
              <Button onClick={onAction} variant="secondary">
                Take Action — {opp.recommendedAction}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => onStatusChange('dismissed')}>
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 !border-success-500/40 !text-success-700 hover:!bg-success-50"
                  onClick={() => onStatusChange('completed')}
                >
                  Mark Complete
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
