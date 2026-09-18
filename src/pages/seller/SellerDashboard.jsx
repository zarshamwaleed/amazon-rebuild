import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSeller } from '../../hooks/useSeller'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Activity,
  AlertTriangle,
} from 'lucide-react'

export default function SellerDashboard() {
  const { seller, loading, isSeller } = useSeller()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isSeller) navigate('/sell/register', { replace: true })
  }, [loading, isSeller, navigate])

  if (loading) {
    return <div className="text-sm text-gray-600">Loading Seller Central…</div>
  }
  if (!seller) return null

  const firstName =
    seller.full_name?.split(' ')[0] || seller.store_name || 'Seller'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const METRICS = [
    { label: 'Sales', value: '$0.00', icon: DollarSign, to: '/seller/reports' },
    { label: 'Orders', value: '0', icon: ShoppingCart, to: '/seller/orders' },
    { label: 'Units', value: '0', icon: Package, to: '/seller/inventory' },
    { label: 'Sessions', value: '0', icon: Users, to: '/seller/reports' },
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
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-gray-500">Account Health</span>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
            Healthy
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => {
          const Icon = m.icon
          return (
            <button
              key={m.label}
              onClick={() => navigate(m.to)}
              className="bg-white border border-gray-200 rounded-lg p-5 text-left hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500">
                  {m.label}
                </span>
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{m.value}</div>
            </button>
          )
        })}
      </div>

      {/* Sales chart placeholder */}
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
        <div className="h-48 flex items-center justify-center bg-gray-50 rounded text-sm text-gray-500">
          No sales data yet. Sales will appear here once you make your first sale.
        </div>
      </div>

      {/* Two-column area */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-3">Inventory alerts</h2>
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>No inventory alerts. Add products to start tracking stock.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-3">Recent orders</h2>
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <ShoppingCart className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p>No orders yet. Orders will show here after customers buy your products.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-3">Account Health</h2>
          <div className="space-y-2 text-sm">
            <HealthRow label="Customer Service" />
            <HealthRow label="Shipping Performance" />
            <HealthRow label="Policy Compliance" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-3">Seller notifications</h2>
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <Activity className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p>No new notifications.</p>
          </div>
        </div>
      </div>
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