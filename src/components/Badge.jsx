const COLOR_MAP = {
  gray: { bg: 'bg-stone-100', text: 'text-stone-700', dot: 'bg-stone-400' },
  green: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  red: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
  yellow: { bg: 'bg-warning-50', text: 'text-warning-700', dot: 'bg-warning-500' },
  blue: { bg: 'bg-info-50', text: 'text-info-700', dot: 'bg-info-500' },
}

export default function Badge({ children, color = 'gray', variant = 'pill', className = '' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.gray

  if (variant === 'dot') {
    return (
      <span className={'inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-700 ' + className}>
        <span className={'w-1.5 h-1.5 rounded-full ' + c.dot} />
        {children}
      </span>
    )
  }

  const shape = variant === 'chip' ? 'rounded-md px-2.5 py-1' : 'rounded-full px-2.5 py-0.5'

  return (
    <span className={'inline-flex items-center gap-1 text-xs font-medium ' + shape + ' ' + c.bg + ' ' + c.text + ' ' + className}>
      {children}
    </span>
  )
}
