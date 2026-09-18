import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RefreshCw,
  ShieldCheck,
  Users,
  Truck,
  FileCheck2,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerHealth } from '../../services/sellerService'
import MiniSalesChart from '../../components/seller/MiniSalesChart'

const SECTION_CONFIG = {
  customerService: { label: 'Customer Service', icon: Users },
  shipping: { label: 'Shipping Performance', icon: Truck },
  policy: { label: 'Policy Compliance', icon: FileCheck2 },
  productCompliance: { label: 'Product Compliance', icon: PackageCheck },
}

const STATUS_STYLES = {
  healthy: {
    label: 'Healthy',
    badge: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
    icon: CheckCircle2,
  },
  warning: {
    label: 'At risk',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Critical',
    badge: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
    icon: XCircle,
  },
}

export default function SellerAccountHealth() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const h = await getSellerHealth(user.id)
      setData(h)
    } catch (err) {
      pushToast('Could not load account health', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  if (loading) {
    return <div className="text-sm text-gray-600">Loading account health…</div>
  }
  if (!data) return null

  const overall = STATUS_STYLES[data.overallStatus]
  const OverallIcon = overall.icon

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Health</h1>
          <p className="text-sm text-gray-600">
            Monitor your performance against Amazon Rebuild's selling policies.
          </p>
        </div>
        <button
          onClick={load}
          className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Overall status banner */}
      <div
        className={
          'rounded-lg p-6 border flex flex-wrap items-center gap-4 ' +
          (data.overallStatus === 'healthy'
            ? 'bg-green-50 border-green-200'
            : data.overallStatus === 'warning'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200')
        }
      >
        <div
          className={
            'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ' +
            (data.overallStatus === 'healthy'
              ? 'bg-green-600 text-white'
              : data.overallStatus === 'warning'
              ? 'bg-amber-500 text-white'
              : 'bg-red-600 text-white')
          }
        >
          <OverallIcon className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Overall Account Health
          </div>
          <div
            className={
              'text-2xl font-bold ' +
              (data.overallStatus === 'healthy'
                ? 'text-green-800'
                : data.overallStatus === 'warning'
                ? 'text-amber-800'
                : 'text-red-800')
            }
          >
            {overall.label}
          </div>
          <p className="text-sm text-gray-700 mt-1">
            {data.counts.totalOrders} orders analyzed ·{' '}
            {data.counts.pendingShipments} awaiting shipment ·{' '}
            {data.counts.cancelledOrders} cancelled
          </p>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Alerts ({data.alerts.length})
          </h2>
          <div className="space-y-3">
            {data.alerts.map((a, i) => (
              <Link
                key={i}
                to={a.to}
                className={
                  'block rounded-lg border p-4 flex items-start gap-3 hover:shadow-sm transition ' +
                  (a.tone === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200')
                }
              >
                <AlertTriangle
                  className={
                    'w-5 h-5 flex-shrink-0 mt-0.5 ' +
                    (a.tone === 'critical' ? 'text-red-600' : 'text-amber-600')
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{a.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{a.detail}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.alerts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-900">
            No critical issues. Keep up the good work.
          </p>
        </div>
      )}

      {/* Health score trend */}
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Health score (last 30 days)
        </h2>
        <MiniSalesChart data={data.series} />
        <p className="text-xs text-gray-500 mt-3">
          Higher is better. Dips indicate cancelled or defective orders on that day.
        </p>
      </section>

      {/* Section grid */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Performance sections</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(data.sections).map(([key, section]) => {
            const cfg = SECTION_CONFIG[key]
            const styles = STATUS_STYLES[section.status]
            const Icon = cfg.icon
            return (
              <div
                key={key}
                className="bg-white border border-gray-200 rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-900">{cfg.label}</h3>
                  </div>
                  <span
                    className={
                      'text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ' +
                      styles.badge
                    }
                  >
                    <span className={'w-1.5 h-1.5 rounded-full ' + styles.dot} />
                    {styles.label}
                  </span>
                </div>

                <ul className="space-y-3">
                  {section.metrics.map((m, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2 last:pb-0"
                    >
                      <div>
                        <div className="text-gray-700">{m.label}</div>
                        <div className="text-xs text-gray-400">
                          Target: {m.threshold}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{m.value}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}