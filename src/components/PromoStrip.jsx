import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function PromoStrip({ title, subtitle, cta, to }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl bg-charcoal-900 px-6 py-8 text-bone-50 md:flex-row md:items-center md:justify-between md:px-10 md:py-10">
      <div className="max-w-xl">
        <h3 className="font-display text-heading-section md:text-heading-page">{title}</h3>
        {subtitle && <p className="mt-2 text-av-body-sm text-bone-100/70">{subtitle}</p>}
      </div>
      {cta && to && (
        <Link
          to={to}
          className="group inline-flex shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-full bg-brass-500 px-5 py-2.5 text-av-body-sm font-semibold text-charcoal-900 transition-avenzo hover:bg-brass-400 md:self-auto"
        >
          {cta}
          <ArrowRight className="w-4 h-4 transition-transform duration-base group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
