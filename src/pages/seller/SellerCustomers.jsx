import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Star,
  MapPin,
  Mail,
  ChevronRight,
  BarChart3,
  Repeat,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerCustomerInsights } from '../../services/sellerService'

export default function SellerCustomers() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const d = await getSellerCustomerInsights(user.id)
      setData(d)
    } catch (err) {
      pushToast('Could not load customer insights', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  if (loading) {
    return <div className="text-sm text-gray-600">Loading customer insights…</div>
  }
  if (!data) return null

  const m = data.metrics

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Insights</h1>
          <p className="text-sm text-gray-600">
            Understand who's buying from you and how often they come back.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/seller/reviews"
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <Star className="w-4 h-4" /> View Reviews
          </Link>
          <button
            onClick={load}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          label="Unique Customers"
          value={m.totalCustomers}
          icon={Users}
          tone="blue"
          sub={`${m.totalOrders} order${m.totalOrders === 1 ? '' : 's'} total`}
        />
        <KpiTile
          label="Repeat Buyers"
          value={m.repeatBuyers}
          icon={Repeat}
          tone="green"
          sub={
            m.totalCustomers > 0
              ? `${m.repeatRate.toFixed(1)}% of customers`
              : 'No repeat customers yet'
          }
        />
        <KpiTile
          label="Avg Order Value"
          value={'$' + m.avgOrderValue.toFixed(2)}
          icon={ShoppingCart}
          tone="amber"
          sub="Per order across all customers"
        />
        <KpiTile
          label="Total Revenue"
          value={'$' + m.totalRevenue.toLocaleString()}
          icon={DollarSign}
          tone="purple"
          sub={`Avg $${m.avgCustomerValue.toFixed(2)} per customer`}
        />
      </div>

      {/* Top customers + distribution */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Top customers */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Top Customers
            </h2>
            <span className="text-xs text-gray-500">By revenue</span>
          </div>

          {data.topCustomers.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No customer orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="text-left px-5 py-3">Customer</th>
                    <th className="text-right px-4 py-3">Orders</th>
                    <th className="text-right px-4 py-3">Revenue</th>
                    <th className="text-right px-5 py-3">Last order</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCustomers.map((c) => (
                    <tr key={c.key} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#232f3e] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[180px]">
                              {c.name}
                            </div>
                            {c.city && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {c.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {c.orders}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ${c.revenue.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-gray-500">
                        {new Date(c.lastOrderAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Distribution */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Order Frequency
            </h2>
            <div className="space-y-3">
              <DistributionRow
                label="1 order"
                count={data.distribution.one}
                total={m.totalCustomers}
                color="from-blue-400 to-blue-500"
              />
              <DistributionRow
                label="2–5 orders"
                count={data.distribution.twoToFive}
                total={m.totalCustomers}
                color="from-amber-400 to-amber-500"
              />
              <DistributionRow
                label="6–10 orders"
                count={data.distribution.sixToTen}
                total={m.totalCustomers}
                color="from-orange-400 to-orange-500"
              />
              <DistributionRow
                label="11+ orders"
                count={data.distribution.elevenPlus}
                total={m.totalCustomers}
                color="from-green-400 to-green-500"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Top Cities
            </h2>
            {data.topCities.length === 0 ? (
              <p className="text-sm text-gray-500">No location data yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.topCities.map((c) => (
                  <li key={c.city} className="flex justify-between">
                    <span className="text-gray-700">{c.city}</span>
                    <span className="text-gray-900 font-medium">{c.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Recent first-time customers */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4" /> Recent New Customers
          </h2>
          <span className="text-xs text-gray-500">
            First purchase in the last {data.recentCustomers.length}
          </span>
        </div>
        {data.recentCustomers.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No recent customers.
          </div>
        ) : (
          <ul className="divide-y">
            {data.recentCustomers.map((c) => (
              <li
                key={c.key}
                className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50"
              >
                <div className="w-9 h-9 rounded-full bg-orange-100 text-[#c7511f] flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {c.name}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    {c.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {c.city}
                      </span>
                    )}
                    <span>
                      First order {new Date(c.firstOrderAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${c.revenue.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {c.orders} order{c.orders === 1 ? '' : 's'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Empty state when no customers at all */}
      {m.totalCustomers === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Users className="w-10 h-10 text-blue-400 mx-auto mb-3" />
          <h3 className="font-bold text-blue-900 mb-1">
            No customer data yet
          </h3>
          <p className="text-sm text-blue-800 max-w-md mx-auto">
            Customer insights appear once you have orders. Products need to be
            added to your catalog and purchased by customers.
          </p>
          <Link
            to="/seller/products"
            className="mt-4 inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
          >
            Manage products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

function KpiTile({ label, value, icon: Icon, tone, sub }) {
  const toneCls = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    green: 'border-green-200 bg-green-50 text-green-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    purple: 'border-purple-200 bg-purple-50 text-purple-900',
  }[tone] || 'border-gray-200 bg-white text-gray-900'

  return (
    <div className={'border rounded-lg p-5 ' + toneCls}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider opacity-70">{label}</span>
        {Icon && <Icon className="w-4 h-4 opacity-60" />}
      </div>
      <div className="text-2xl md:text-3xl font-bold">{value}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  )
}

function DistributionRow({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium text-gray-900">
          {count} ({Math.round(pct)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded overflow-hidden">
        <div
          className={'h-full bg-gradient-to-r ' + color}
          style={{ width: pct + '%' }}
        />
      </div>
    </div>
  )
}