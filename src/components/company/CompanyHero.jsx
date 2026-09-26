import { Link } from 'react-router-dom'

/**
 * Shared hero band for the six static company pages (About, Careers, Press,
 * Investor Relations, Sustainability, Accessibility) — keeps them reading as
 * one family instead of six one-off layouts.
 */
export default function CompanyHero({ label, title, subtitle }) {
  return (
    <div className="bg-bone-100 border-b border-stone-200">
      <div className="max-w-[900px] mx-auto px-6 min-h-[220px] md:min-h-[240px] flex flex-col justify-center py-10">
        <nav className="text-label mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-charcoal-900 transition-avenzo">Home</Link>
          <span className="mx-1.5 text-stone-400">/</span>
          <span className="text-charcoal-700">{label}</span>
        </nav>
        <h1 className="font-display text-display-sm md:text-display font-medium text-charcoal-900">
          {title}
        </h1>
        {subtitle && <p className="text-body mt-3 max-w-[640px]">{subtitle}</p>}
      </div>
    </div>
  )
}
