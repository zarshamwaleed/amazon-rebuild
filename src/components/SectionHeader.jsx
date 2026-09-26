import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function SectionHeader({
  title,
  subtitle,
  seeMoreTo,
  ctaLabel = 'See more',
  align = 'left',
  className = '',
}) {
  const centered = align === 'center'
  return (
    <div
      className={
        'flex gap-4 mb-6 md:mb-8 ' +
        (centered ? 'flex-col items-center text-center' : 'items-end justify-between') +
        ' ' +
        className
      }
    >
      <div className={centered ? 'max-w-xl' : ''}>
        <h2 className="font-display text-heading-section md:text-heading-page text-charcoal-900">
          {title}
        </h2>
        {subtitle && <p className="text-body-sm mt-1.5 max-w-xl">{subtitle}</p>}
      </div>
      {seeMoreTo && (
        <Link
          to={seeMoreTo}
          className="group shrink-0 inline-flex items-center gap-1.5 text-av-label uppercase tracking-wide text-brass-700 whitespace-nowrap transition-avenzo hover:text-brass-800"
        >
          {ctaLabel}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-base group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
