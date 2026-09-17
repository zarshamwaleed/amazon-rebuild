export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm'
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
    secondary: 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 focus:ring-yellow-400',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-400',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-600',
  }
  const cls = base + ' ' + (variants[variant] || variants.primary) + ' ' + className
  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  )
}
