export default function EmptyState({ title = 'Nothing here', message }) {
  return (
    <div className="text-center py-12 bg-white border border-gray-200 rounded-md">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
    </div>
  )
}
