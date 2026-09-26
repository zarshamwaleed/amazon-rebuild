import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

/**
 * Shared page-header chrome for Seller Central pages — title, description,
 * an optional back link, and a right-aligned actions slot. Use this at the
 * top of every seller page so page titles/actions line up consistently.
 */
export default function SellerPageHeader({ title, description, backTo, actions, children }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {backTo && (
            <Link
              to={backTo}
              className="inline-flex items-center gap-1 text-body-sm hover:text-charcoal-900 transition-avenzo mb-1.5 -ml-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </Link>
          )}
          <h1 className="heading-page">{title}</h1>
          {description && <p className="text-body-sm mt-1 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
