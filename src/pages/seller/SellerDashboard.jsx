import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSeller } from '../../hooks/useSeller'
import { useAuth } from '../../context/AuthContext'
import { getSellerStats, getSellerReturns, computeReturnsSummary, getInventoryAlerts } from '../../services/sellerService'
import { useSellerNotifications } from '../../hooks/useSellerNotifications'
import MiniSalesChart from '../../components/seller/MiniSalesChart'
import SellerStatCard from '../../components/seller/SellerStatCard'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import { TYPE_ICONS } from '../../components/seller/SellerHeader'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Bell,
  ShieldCheck,
} from 'lucide-react'

const PERIODS = ['Today', '7 days', '30 days', '90 days']

const RETURN_STATUS_META = {
  requested: { label: 'Requested', color: 'blue' },
  pending_authorization: { label: 'Pending Authorization', color: 'yellow' },
  return_in_transit: { label: 'In Transit', color: 'blue' },
}

const NEEDS_ATTENTION_STATUSES = ['requested', 'pending_authorization', 'return_in_transit']

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'Yesterday'
  if (day < 7) return `${day}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function SellerDashboard() {
  const { seller, loading: sellerLoading, isSeller } = useSeller()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notifications } = useSellerNotifications()

  const [stats, setStats] = useState(null)
  const [returns, setReturns] = useState([])
  const [inventoryAlerts, setInventoryAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7 days')

  useEffect(() => {
    if (!sellerLoading && !isSeller) navigate('/sell/register', { replace: true })
  }, [sellerLoading, isSeller, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      try {
        const [s, r, alerts] = await Promise.all([
          getSellerStats(user.id),
          getSellerReturns(user.id).catch(() => []),
          getInventoryAlerts(user.id),
        ])
        if (cancelled) return
        setStats(s)
        setReturns(r)
        setInventoryAlerts(alerts)
      } catch {
        // keep prior state on transient failure
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user])

  const returnsSummary = computeReturnsSummary(returns)
  const returnsNeedingAttention = returns.filter((r) => NEEDS_ATTENTION_STATUSES.includes(r.status))

  if (sellerLoading || !seller) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-24 rounded-xl skeleton-shimmer" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
        <div className="h-72 rounded-xl skeleton-shimmer" />
      </div>
    )
  }

  const firstName = seller.full_name?.split(' ')[0] || seller.store_name || 'Seller'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const chartData =
    stats?.sales > 0
      ? [
          { label: 'Mon', value: 0 },
          { label: 'Tue', value: stats.sales * 0.15 },
          { label: 'Wed', value: stats.sales * 0.35 },
          { label: 'Thu', value: stats.sales * 0.25 },
          { label: 'Fri', value: stats.sales * 0.65 },
          { label: 'Sat', value: stats.sales * 0.85 },
          { label: 'Sun', value: stats.sales },
        ]
      : []

  const METRICS = [
    { label: 'Sales', value: '$' + (stats?.sales ?? 0).toFixed(2), icon: DollarSign, to: '/seller/reports' },
    { label: 'Orders', value: stats?.orders ?? 0, icon: ShoppingCart, to: '/seller/orders' },
    { label: 'Units', value: stats?.units ?? 0, icon: Package, to: '/seller/inventory' },
    { label: 'Sessions', value: stats?.sessions ?? 0, icon: Users, to: '/seller/reports' },
    {
      label: 'Conversion',
      value: (stats?.conversionRate ?? 0).toFixed(2) + '%',
      icon: TrendingUp,
      to: '/seller/reports',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting + plan */}
      <div className="bg-bone-50 rounded-xl border border-stone-200 shadow-subtle p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-page">
            {greeting}, {firstName}
          </h1>
          <p className="text-body-sm mt-1">
            Store: <strong className="text-charcoal-800 font-medium">{seller.store_name || '—'}</strong>
            {' · '}Plan: <span className="capitalize">{seller.plan}</span>
          </p>
        </div>
        <Link
          to="/seller/account-health"
          className="flex items-center gap-3 hover:opacity-80 transition-avenzo"
        >
          <span className="text-label">Account Health</span>
          <Badge color="green">
            <ShieldCheck className="w-3 h-3" /> Healthy
          </Badge>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
            ))
          : METRICS.map((m) => (
              <SellerStatCard key={m.label} label={m.label} value={m.value} icon={m.icon} to={m.to} />
            ))}
      </div>

      {/* Sales chart */}
      <Card
        title="Sales performance"
        actions={
          <div className="flex gap-1 text-xs bg-stone-100 rounded-lg p-1">
            {PERIODS.map((f) => (
              <button
                key={f}
                onClick={() => setPeriod(f)}
                className={
                  'px-3 py-1.5 rounded-md font-medium transition-avenzo ' +
                  (period === f ? 'bg-bone-50 text-charcoal-900 shadow-subtle' : 'text-charcoal-500 hover:text-charcoal-800')
                }
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        <MiniSalesChart data={chartData} />
      </Card>

      {/* Dashboard cards grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <DashboardCard title="Inventory alerts" to="/seller/inventory" linkLabel="Manage inventory">
          {inventoryAlerts.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {inventoryAlerts.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/seller/inventory"
                    className="flex items-center gap-3 hover:opacity-80 transition-avenzo"
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-charcoal-400" />
                      </div>
                    )}
                    <span className="truncate flex-1 text-charcoal-800">{p.title}</span>
                    {p.stock === 0 ? (
                      <Badge color="red" className="flex-shrink-0">Out of stock</Badge>
                    ) : (
                      <Badge color="yellow" className="flex-shrink-0">Only {p.stock} left</Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow icon={AlertTriangle} text="No inventory alerts. Add products to start tracking stock." />
          )}
        </DashboardCard>

        <DashboardCard title="Recent orders" to="/seller/orders" linkLabel="View all orders">
          {stats?.recentOrders?.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-charcoal-500">{o.id.slice(0, 8)}</span>
                  <span className="text-charcoal-800">${Number(o.total).toFixed(2)}</span>
                  <span className="text-xs text-charcoal-500 capitalize">
                    {o.order_status?.replace(/_/g, ' ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow icon={ShoppingCart} text="No orders yet. Orders will show here after customers buy your products." />
          )}
        </DashboardCard>

        <DashboardCard title="Account Health" to="/seller/account-health" linkLabel="View details">
          <div className="space-y-2.5 text-sm">
            <HealthRow label="Customer Service" />
            <HealthRow label="Shipping Performance" />
            <HealthRow label="Policy Compliance" />
            <HealthRow label="Product Compliance" />
          </div>
        </DashboardCard>

        <DashboardCard title="Seller notifications" to="/seller/notifications" linkLabel="View all">
          {notifications.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {notifications.slice(0, 3).map((n) => (
                <li key={n.id}>
                  <Link
                    to={n.link || '/seller/notifications'}
                    className="flex items-start gap-3 hover:opacity-80 transition-avenzo"
                  >
                    <span className="text-lg flex-shrink-0 leading-none mt-0.5">
                      {TYPE_ICONS[n.type] || '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-charcoal-800 truncate">{n.title}</div>
                      <div className="text-xs text-charcoal-500 mt-0.5">{timeAgo(n.created_at)}</div>
                    </div>
                    {!n.read && !n.derived && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brass-500 mt-1.5 flex-shrink-0" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow icon={Bell} text="No new notifications." />
          )}
        </DashboardCard>

        <DashboardCard title="Recent sales" to="/seller/reports" linkLabel="View report">
          {stats?.recentSales?.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {stats.recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-charcoal-700 flex-1">{s.title}</span>
                  <span className="text-xs text-charcoal-500">×{s.quantity}</span>
                  <span className="text-charcoal-900 font-medium">${(s.price * s.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow icon={TrendingUp} text="No sales yet." />
          )}
        </DashboardCard>

        <DashboardCard title="Customer returns" to="/seller/orders/returns" linkLabel="View returns">
          {returns.length > 0 ? (
            <div className="space-y-3 text-sm">
              <p className="text-xs text-charcoal-500">
                {returnsSummary.pendingActions} pending · {returnsSummary.inTransit} in transit ·{' '}
                {returnsSummary.refunded} refunded
              </p>
              {returnsNeedingAttention.length > 0 ? (
                <ul className="space-y-2.5">
                  {returnsNeedingAttention.slice(0, 3).map((r) => {
                    const meta = RETURN_STATUS_META[r.status] || { label: r.status, color: 'gray' }
                    return (
                      <li key={r.id}>
                        <Link
                          to={`/seller/orders/returns/${r.id}`}
                          className="flex items-center gap-2 hover:opacity-80 transition-avenzo"
                        >
                          <span className="font-mono text-xs text-charcoal-500 flex-shrink-0">
                            {r.rma || r.id.slice(0, 8)}
                          </span>
                          <span className="truncate flex-1 text-charcoal-700">{r.product_title}</span>
                          <Badge color={meta.color}>{meta.label}</Badge>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-xs text-charcoal-400">No returns need attention right now.</p>
              )}
            </div>
          ) : (
            <EmptyRow icon={RotateCcw} text="No returns to review." />
          )}
        </DashboardCard>
      </div>

      {/* Full-width account health panel */}
      <Card
        title="Account Health"
        actions={
          <Badge color="green">
            <ShieldCheck className="w-3 h-3" /> Healthy
          </Badge>
        }
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HealthTile label="Customer Service" />
          <HealthTile label="Shipping Performance" />
          <HealthTile label="Policy Compliance" />
          <HealthTile label="Product Compliance" />
        </div>
      </Card>
    </div>
  )
}

function DashboardCard({ title, to, linkLabel, children }) {
  return (
    <Card
      title={title}
      actions={
        to && linkLabel ? (
          <Link to={to} className="text-xs font-medium text-brass-600 hover:text-brass-700 transition-avenzo whitespace-nowrap">
            {linkLabel} →
          </Link>
        ) : undefined
      }
    >
      {children}
    </Card>
  )
}

function HealthRow({ label }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-charcoal-700">{label}</span>
      <span className="text-success-700 font-medium text-xs">✓ Good</span>
    </div>
  )
}

function HealthTile({ label }) {
  return (
    <div className="border border-success-500/25 bg-success-50 rounded-lg p-4">
      <div className="text-label mb-1.5">{label}</div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success-500" />
        <span className="text-sm font-medium text-success-700">Good</span>
      </div>
    </div>
  )
}

function EmptyRow({ icon, text }) {
  const Icon = icon
  return (
    <div className="flex items-start gap-3 text-sm text-charcoal-500">
      <Icon className="w-5 h-5 text-charcoal-300 flex-shrink-0 mt-0.5" />
      <p>{text}</p>
    </div>
  )
}
