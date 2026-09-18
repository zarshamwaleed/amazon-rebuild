import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSeller } from '../../hooks/useSeller'
import { useAuth } from '../../context/AuthContext'
import { getSellerStats } from '../../services/sellerService'
import MiniSalesChart from '../../components/seller/MiniSalesChart'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Bell,
} from 'lucide-react'

export default function SellerDashboard() {
  const { seller, loading: sellerLoading, isSeller } = useSeller()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sellerLoading && !isSeller) navigate('/sell/register', { replace: true })
  }, [sellerLoading, isSeller, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    getSellerStats(user.id)
      .then((s) => {
        if (!cancelled) setStats(s)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  if (sellerLoading || !seller) {
    return <div className="text-sm text-gray-600">Loading Seller Central…</div>
  }

  const firstName = seller.full_name?.split(' ')[0] || seller.store_name || 'Seller'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Chart data — build a simple placeholder trend if there are sales
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
    <div className="space-y-6">
      {/* Greeting + plan */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Store: <strong>{seller.store_name || '—'}</strong> · Plan:{' '}
            <span className="capitalize">{seller.plan}</span>
          </p>
        </div>
        <Link to="/seller/account-health" className="flex items-center gap-3 hover:opacity-80">
          <span className="text-xs uppercase tracking-wider text-gray-500">Account Health</span>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
            Healthy
          </span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {METRICS.map((m) => {
          const Icon = m.icon
          return (
            <button
              key={m.label}
              onClick={() => navigate(m.to)}
              className="bg-white border border-gray-200 rounded-lg p-5 text-left hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500">{m.label}</span>
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{m.value}</div>
            </button>
          )
        })}
      </div>

      {/* Sales chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Sales performance</h2>
          <div className="flex gap-1 text-xs">
            {['Today', '7 days', '30 days', '90 days'].map((f, i) => (
              <button
                key={f}
                className={
                  'px-3 py-1 rounded ' +
                  (i === 1
                    ? 'bg-[#232f3e] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <MiniSalesChart data={chartData} />
      </div>

      {/* Dashboard cards grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Inventory alerts */}
        <DashboardCard title="Inventory alerts" to="/seller/inventory" linkLabel="Manage inventory">
          {stats?.lowStock?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {stats.lowStock.slice(0, 3).map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{p.title}</span>
                  <span className="ml-auto text-xs">only {p.stock} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow
              icon={AlertTriangle}
              text="No inventory alerts. Add products to start tracking stock."
            />
          )}
        </DashboardCard>

        {/* Recent orders */}
        <DashboardCard title="Recent orders" to="/seller/orders" linkLabel="View all orders">
          {stats?.recentOrders?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-500">{o.id.slice(0, 8)}</span>
                  <span className="text-gray-700">${Number(o.total).toFixed(2)}</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {o.order_status?.replace(/_/g, ' ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow
              icon={ShoppingCart}
              text="No orders yet. Orders will show here after customers buy your products."
            />
          )}
        </DashboardCard>

        {/* Account Health */}
        <DashboardCard title="Account Health" to="/seller/account-health" linkLabel="View details">
          <div className="space-y-2 text-sm">
            <HealthRow label="Customer Service" />
            <HealthRow label="Shipping Performance" />
            <HealthRow label="Policy Compliance" />
            <HealthRow label="Product Compliance" />
          </div>
        </DashboardCard>

        {/* Seller notifications */}
        <DashboardCard title="Seller notifications" linkLabel="View all">
          <EmptyRow icon={Bell} text="No new notifications." />
        </DashboardCard>

        {/* Recent sales */}
        <DashboardCard title="Recent sales" to="/seller/reports" linkLabel="View report">
          {stats?.recentSales?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {stats.recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-gray-700">{s.title}</span>
                  <span className="text-xs text-gray-500">×{s.quantity}</span>
                  <span className="text-gray-900">${(s.price * s.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow icon={TrendingUp} text="No sales yet." />
          )}
        </DashboardCard>

        {/* Customer returns */}
        <DashboardCard title="Customer returns" to="/seller/orders/returns" linkLabel="View returns">
          <EmptyRow icon={RotateCcw} text="No returns to review." />
        </DashboardCard>
      </div>

      {/* Full-width account health panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Account Health</h2>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
            Healthy
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HealthTile label="Customer Service" />
          <HealthTile label="Shipping Performance" />
          <HealthTile label="Policy Compliance" />
          <HealthTile label="Product Compliance" />
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ title, to, linkLabel, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900">{title}</h2>
        {to && linkLabel && (
          <Link to={to} className="text-xs text-[#007185] hover:underline">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function HealthRow({ label }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <span className="text-green-700 font-medium">✓ Good</span>
    </div>
  )
}

function HealthTile({ label }) {
  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium text-green-800">Good</span>
      </div>
    </div>
  )
}

function EmptyRow({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3 text-sm text-gray-600">
      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
      <p>{text}</p>
    </div>
  )
}