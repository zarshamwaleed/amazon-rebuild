import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const TONE_CLASS = {
  success: 'text-success-700',
  error: 'text-error-700',
}

/**
 * A single KPI tile for seller dashboards/reports. `trend` is optional:
 * { direction: 'up' | 'down', label: '+12.4%' } — direction 'up' reads as
 * good news (success) by default; pass `invert` when a rise is bad news
 * (e.g. return rate) so it renders with the error tone instead. `tone`
 * ('success' | 'error') is an additive, independent override for the value's
 * color when the tile has no trend — e.g. a fees/refunds tile that should
 * always read red regardless of trend direction.
 */
export default function SellerStatCard({ label, value, icon, trend, to, invert = false, tone, className = '' }) {
  const Icon = icon
  const isGood = trend && (invert ? trend.direction === 'down' : trend.direction === 'up')
  const TrendIcon = trend?.direction === 'down' ? ArrowDownRight : ArrowUpRight
  const valueCls = TONE_CLASS[tone] || 'text-charcoal-900'

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-label">{label}</span>
        {Icon && (
          <span className="w-8 h-8 rounded-lg bg-brass-50 text-brass-600 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={'font-display text-2xl leading-none ' + valueCls}>{value}</span>
        {trend && (
          <span
            className={
              'inline-flex items-center gap-0.5 text-xs font-medium ' +
              (isGood ? 'text-success-700' : 'text-error-700')
            }
          >
            <TrendIcon className="w-3.5 h-3.5" />
            {trend.label}
          </span>
        )}
      </div>
    </>
  )

  const base =
    'block text-left bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-5 transition-avenzo ' + className

  if (to) {
    return (
      <Link to={to} className={base + ' hover:shadow-soft hover:border-stone-300'}>
        {content}
      </Link>
    )
  }
  return <div className={base}>{content}</div>
}
