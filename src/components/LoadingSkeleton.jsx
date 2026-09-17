export default function LoadingSkeleton({ count = 4, cols = 4 }) {
  const colClass =
    cols === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  return (
    <div className={'grid gap-4 ' + colClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-md p-3 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded mb-3" />
          <div className="h-3 bg-gray-100 rounded mb-2 w-3/4" />
          <div className="h-3 bg-gray-100 rounded mb-2 w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}
