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
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'

const SECTION_CONFIG = {
  customerService: { label: 'Customer Service', icon: Users },
  shipping: { label: 'Shipping Performance', icon: Truck },
  policy: { label: 'Policy Compliance', icon: FileCheck2 },
  productCompliance: { label: 'Product Compliance', icon: PackageCheck },
}

const STATUS_STYLES = {
  healthy: {
    label: 'Healthy',
    badgeColor: 'green',
    banner: 'bg-success-50 border-success-500/25',
    iconWrap: 'bg-success-500 text-bone-50',
    text: 'text-success-700',
    icon: CheckCircle2,
  },
  warning: {
    label: 'At risk',
    badgeColor: 'yellow',
    banner: 'bg-warning-50 border-warning-500/25',
    iconWrap: 'bg-warning-500 text-bone-50',
    text: 'text-warning-700',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Critical',
    badgeColor: 'red',
    banner: 'bg-error-50 border-error-500/25',
    iconWrap: 'bg-error-500 text-bone-50',
    text: 'text-error-700',
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
    } catch {
      pushToast('Could not load account health', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 rounded-lg skeleton-shimmer" />
        <div className="h-28 rounded-xl skeleton-shimmer" />
        <div className="h-56 rounded-xl skeleton-shimmer" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-48 rounded-xl skeleton-shimmer" />
          <div className="h-48 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    )
  }
  if (!data) return null

  const overall = STATUS_STYLES[data.overallStatus]
  const OverallIcon = overall.icon

  return (
    <div className="space-y-6">
      <SellerPageHeader
        title="Account Health"
        description="Monitor your performance against Avenzo's selling policies."
        actions={
          <Button variant="outline" size="md" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        }
      />

      {/* Overall status banner */}
      <div className={'rounded-xl p-6 border shadow-subtle flex flex-wrap items-center gap-4 ' + overall.banner}>
        <div className={'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ' + overall.iconWrap}>
          <OverallIcon className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-label mb-1">Overall Account Health</div>
          <div className={'font-display text-2xl ' + overall.text}>{overall.label}</div>
          <p className="text-body-sm mt-1">
            {data.counts.totalOrders} orders analyzed · {data.counts.pendingShipments} awaiting shipment ·{' '}
            {data.counts.cancelledOrders} cancelled
          </p>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <section>
          <h2 className="heading-section mb-3">Alerts ({data.alerts.length})</h2>
          <div className="space-y-3">
            {data.alerts.map((a, i) => {
              const style = a.tone === 'critical' ? STATUS_STYLES.critical : STATUS_STYLES.warning
              return (
                <Link
                  key={i}
                  to={a.to}
                  className={'block rounded-xl border p-4 flex items-start gap-3 hover:shadow-soft transition-avenzo ' + style.banner}
                >
                  <AlertTriangle className={'w-5 h-5 flex-shrink-0 mt-0.5 ' + style.text} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-charcoal-900">{a.title}</div>
                    <div className="text-xs text-charcoal-600 mt-0.5">{a.detail}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-charcoal-400 flex-shrink-0 mt-1" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {data.alerts.length === 0 && (
        <div className="bg-success-50 border border-success-500/25 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-success-700" />
          <p className="text-sm text-success-700">No critical issues. Keep up the good work.</p>
        </div>
      )}

      {/* Health score trend */}
      <Card title="Health score (last 30 days)">
        <MiniSalesChart data={data.series} formatValue={(v) => Math.round(v) + ' pts'} />
        <p className="text-caption mt-3">
          Higher is better. Dips indicate cancelled or defective orders on that day.
        </p>
      </Card>

      {/* Section grid */}
      <section>
        <h2 className="heading-section mb-3">Performance sections</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(data.sections).map(([key, section]) => {
            const cfg = SECTION_CONFIG[key]
            const Icon = cfg.icon
            const styles = STATUS_STYLES[section.status]
            return (
              <Card
                key={key}
                title={
                  <span className="inline-flex items-center gap-2">
                    <Icon className="w-4 h-4 text-charcoal-500" /> {cfg.label}
                  </span>
                }
                actions={<Badge color={styles.badgeColor}>{styles.label}</Badge>}
              >
                <ul className="space-y-3">
                  {section.metrics.map((m, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm border-b border-stone-100 last:border-b-0 pb-2.5 last:pb-0"
                    >
                      <div>
                        <div className="text-charcoal-700">{m.label}</div>
                        <div className="text-caption">Target: {m.threshold}</div>
                      </div>
                      <div className="font-medium text-charcoal-900">{m.value}</div>
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
