const PADDING = {
  none: { head: '', body: '', foot: '' },
  sm: { head: 'px-4 pt-4 pb-3', body: 'px-4 py-4', foot: 'px-4 pb-4 pt-3' },
  md: { head: 'px-6 pt-6 pb-4', body: 'px-6 py-6', foot: 'px-6 pb-6 pt-4' },
  lg: { head: 'px-8 pt-8 pb-5', body: 'px-8 py-8', foot: 'px-8 pb-8 pt-5' },
}

export default function Card({
  title,
  subtitle,
  actions,
  footer,
  padding = 'md',
  hoverable = false,
  className = '',
  children,
}) {
  const pad = PADDING[padding] || PADDING.md
  const hasHeader = Boolean(title || subtitle || actions)

  return (
    <div
      className={
        'bg-bone-50 border border-stone-200 rounded-xl shadow-subtle transition-avenzo ' +
        (hoverable ? 'hover:shadow-soft hover:border-stone-300 ' : '') +
        className
      }
    >
      {hasHeader && (
        <div className={'flex items-start justify-between gap-4 border-b border-stone-200 ' + pad.head}>
          <div>
            {title && <h3 className="heading-sub">{title}</h3>}
            {subtitle && <p className="text-caption mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {children != null && <div className={pad.body}>{children}</div>}

      {footer && (
        <div className={'border-t border-stone-200 bg-stone-50 rounded-b-xl ' + pad.foot}>
          {footer}
        </div>
      )}
    </div>
  )
}
