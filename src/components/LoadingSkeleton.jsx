export default function LoadingSkeleton({ count = 4, cols = 4 }) {
  const colClass =
    cols === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  return (
    <div className={'grid gap-4 ' + colClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-bone-50 border border-stone-200 rounded-xl p-3">
          <div className="skeleton-shimmer aspect-square rounded-lg mb-3" />
          <div className="skeleton-shimmer h-3 rounded-md mb-2 w-3/4" />
          <div className="skeleton-shimmer h-3 rounded-md mb-2 w-1/2" />
          <div className="skeleton-shimmer h-3 rounded-md w-1/3" />
        </div>
      ))}
    </div>
  )
}
