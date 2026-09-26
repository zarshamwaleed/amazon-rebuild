import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getCategoryImageOverride } from '../data/categoryImages'

/**
 * Full-bleed single-image category hero (Category/Products/Search): one
 * image, one left-to-right dark gradient, text overlaid on the left,
 * result count on the right. Fixed height (not min-height) — the text
 * column is width-constrained (left+right offsets, not just max-width) so
 * `truncate` actually clips long titles/descriptions horizontally instead
 * of letting them wrap and overflow the fixed-height, overflow-hidden band.
 */
export default function CategoryHeroBanner({
  title,
  description,
  eyebrow = 'Category',
  image,
  categorySlug,
  breadcrumb,
  monogramLabel,
  resultCount,
}) {
  const resolvedImage = getCategoryImageOverride(categorySlug) || image
  const hasImage = Boolean(resolvedImage)
  const monogramSource = monogramLabel || (typeof title === 'string' ? title : '')
  const monogram = (monogramSource || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="relative mb-6 md:mb-8 h-[180px] md:h-[200px] lg:h-[240px] rounded-[14px] overflow-hidden animate-fade-in-up">
      {hasImage ? (
        <>
          <img src={resolvedImage} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(20,20,20,0.65) 0%, rgba(20,20,20,0.25) 50%, rgba(20,20,20,0.05) 100%)',
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-bone-200 via-bone-100 to-bone-300" />
          <span className="absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 font-display italic text-brass-400/50 text-[120px] md:text-[150px] lg:text-[180px] leading-none select-none pointer-events-none">
            {monogram}
          </span>
        </>
      )}

      <div
        className={`absolute inset-y-0 left-0 right-24 md:right-28 lg:right-36 max-w-[560px] flex flex-col justify-center gap-1.5 pl-5 md:pl-6 lg:pl-10 ${
          hasImage ? 'text-bone-50' : 'text-charcoal-900'
        }`}
      >
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            className={`flex items-center gap-1 text-[11px] uppercase tracking-wide truncate ${
              hasImage ? 'text-bone-50/70' : 'text-charcoal-500/80'
            }`}
            aria-label="Breadcrumb"
          >
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="transition-avenzo hover:underline underline-offset-2">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && (
          <p
            className={`text-[11px] uppercase tracking-widest font-medium truncate ${
              hasImage ? 'text-brass-300' : 'text-brass-600'
            }`}
          >
            {eyebrow}
          </p>
        )}

        <h1 className="font-display text-[30px] md:text-[36px] lg:text-[44px] leading-tight tracking-tight truncate">
          {title}
        </h1>

        {description && (
          <p className={`text-sm truncate ${hasImage ? 'text-bone-50/80' : 'text-charcoal-600/80'}`}>
            {description}
          </p>
        )}
      </div>

      {typeof resultCount === 'number' && (
        <div
          className={`absolute right-5 md:right-6 lg:right-10 top-1/2 -translate-y-1/2 text-[13px] whitespace-nowrap ${
            hasImage ? 'text-bone-50/80' : 'text-charcoal-600/80'
          }`}
        >
          {resultCount.toLocaleString()} result{resultCount === 1 ? '' : 's'}
        </div>
      )}
    </div>
  )
}
