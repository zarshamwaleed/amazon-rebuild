import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Star,
  MapPin,
  ChevronRight,
  Repeat,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerCustomerInsights } from '../../services/sellerService'
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import SellerStatCard from '../../components/seller/SellerStatCard'
import Button from '../../components/Button'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'

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
    } catch {
      pushToast('Could not load customer insights', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="h-10 w-64 rounded-lg skeleton-shimmer" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
        <div className="h-72 rounded-xl skeleton-shimmer" />
      </div>
    )
  }
  if (!data) return null

  const m = data.metrics

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Customer Insights"
        description="Understand who's buying from you and how often they come back."
        actions={
          <>
            <Link to="/seller/reviews">
              <Button variant="outline" size="md">
                <Star className="w-4 h-4" /> View Reviews
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={load} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        }
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SellerStatCard
          label="Unique Customers"
          value={m.totalCustomers}
          icon={Users}
          trend={{ direction: 'up', label: `${m.totalOrders} order${m.totalOrders === 1 ? '' : 's'}` }}
        />
        <SellerStatCard
          label="Repeat Buyers"
          value={m.repeatBuyers}
          icon={Repeat}
          trend={
            m.totalCustomers > 0
              ? { direction: 'up', label: `${m.repeatRate.toFixed(1)}%` }
              : undefined
          }
        />
        <SellerStatCard
          label="Avg Order Value"
          value={'$' + m.avgOrderValue.toFixed(2)}
          icon={ShoppingCart}
        />
        <SellerStatCard
          label="Total Revenue"
          value={'$' + m.totalRevenue.toLocaleString()}
          icon={DollarSign}
          trend={{ direction: 'up', label: `$${m.avgCustomerValue.toFixed(2)}/cust.` }}
        />
      </div>

      {/* Top customers + distribution */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card
          padding="none"
          className="lg:col-span-2 overflow-hidden"
          title="Top Customers"
          subtitle="By revenue"
        >
          {data.topCustomers.length === 0 ? (
            <div className="p-10 text-center text-body-sm">No customer orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-label">Customer</th>
                    <th className="text-right px-4 py-3 text-label">Orders</th>
                    <th className="text-right px-4 py-3 text-label">Revenue</th>
                    <th className="text-right px-5 py-3 text-label">Last order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.topCustomers.map((c) => (
                    <tr key={c.key} className="hover:bg-stone-50/60 transition-avenzo">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-charcoal-900 text-brass-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-charcoal-900 truncate max-w-[180px]">
                              {c.name}
                            </div>
                            {c.city && (
                              <div className="text-xs text-charcoal-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {c.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-charcoal-700">{c.orders}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-charcoal-900">
                        ${c.revenue.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-charcoal-500">
                        {new Date(c.lastOrderAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Distribution */}
        <div className="space-y-5">
          <Card title="Order Frequency">
            <div className="space-y-3">
              <DistributionRow label="1 order" count={data.distribution.one} total={m.totalCustomers} />
              <DistributionRow label="2–5 orders" count={data.distribution.twoToFive} total={m.totalCustomers} />
              <DistributionRow label="6–10 orders" count={data.distribution.sixToTen} total={m.totalCustomers} />
              <DistributionRow label="11+ orders" count={data.distribution.elevenPlus} total={m.totalCustomers} />
            </div>
          </Card>

          <Card title="Top Cities">
            {data.topCities.length === 0 ? (
              <p className="text-body-sm">No location data yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.topCities.map((c) => (
                  <li key={c.city} className="flex justify-between">
                    <span className="text-charcoal-700">{c.city}</span>
                    <span className="text-charcoal-900 font-medium">{c.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Recent first-time customers */}
      <Card
        padding="none"
        className="overflow-hidden"
        title="Recent New Customers"
        subtitle={`First purchase in the last ${data.recentCustomers.length}`}
      >
        {data.recentCustomers.length === 0 ? (
          <div className="p-10 text-center text-body-sm">No recent customers.</div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {data.recentCustomers.map((c) => (
              <li key={c.key} className="px-5 py-3.5 flex items-center gap-4 hover:bg-stone-50/60 transition-avenzo">
                <div className="w-9 h-9 rounded-full bg-brass-50 text-brass-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-charcoal-900 truncate">{c.name}</div>
                  <div className="text-xs text-charcoal-500 flex items-center gap-2 mt-0.5">
                    {c.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {c.city}
                      </span>
                    )}
                    <span>First order {new Date(c.firstOrderAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-charcoal-900">${c.revenue.toFixed(2)}</div>
                  <div className="text-xs text-charcoal-500">
                    {c.orders} order{c.orders === 1 ? '' : 's'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Empty state when no customers at all */}
      {m.totalCustomers === 0 && (
        <EmptyState
          icon={Users}
          title="No customer data yet"
          message="Customer insights appear once you have orders. Products need to be added to your catalog and purchased by customers."
          action={
            <Link to="/seller/products">
              <Button variant="primary">
                Manage products <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          }
        />
      )}
    </div>
  )
}

function DistributionRow({ label, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-charcoal-600 mb-1">
        <span>{label}</span>
        <span className="font-medium text-charcoal-900">
          {count} ({Math.round(pct)}%)
        </span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-brass-400 transition-avenzo" style={{ width: pct + '%' }} />
      </div>
    </div>
  )
}
