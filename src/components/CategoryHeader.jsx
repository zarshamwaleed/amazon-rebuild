export default function CategoryHeader({ title, count, description }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        <span className="text-sm text-gray-600">
          {typeof count === 'number' ? count + ' result' + (count === 1 ? '' : 's') : ''}
        </span>
      </div>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </div>
  )
}
