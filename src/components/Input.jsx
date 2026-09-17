export default function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className={
          'w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ' +
          (error ? 'border-red-500 ' : 'border-gray-300 ') +
          className
        }
        {...props}
      />
      {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
