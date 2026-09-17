import { Link } from 'react-router-dom'

const PRICE_BUCKETS = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 to $50', min: 25, max: 50 },
  { label: '$50 to $100', min: 50, max: 100 },
  { label: '$100 to $200', min: 100, max: 200 },
  { label: '$200 & Above', min: 200, max: undefined },
]

export default function FilterSidebar({
  categories = [],
  activeCategorySlug,
  activeCategoryId,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  onClear,
}) {
  return (
    <aside className="hidden lg:block w-56 flex-shrink-0">
      <div className="sticky top-40 space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 mb-2">Category</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <button
                onClick={() => onCategoryChange && onCategoryChange(null)}
                className={
                  'text-left w-full hover:text-[#c7511f] ' +
                  (!activeCategoryId ? 'font-bold text-[#c7511f]' : 'text-gray-700')
                }
              >
                All Categories
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onCategoryChange && onCategoryChange(c)}
                  className={
                    'text-left w-full hover:text-[#c7511f] ' +
                    (activeCategoryId === c.id ? 'font-bold text-[#c7511f]' : 'text-gray-700')
                  }
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-2">Price</h3>
          <ul className="space-y-1 text-sm">
            {PRICE_BUCKETS.map((b) => {
              const active = minPrice === b.min && maxPrice === b.max
              return (
                <li key={b.label}>
                  <button
                    onClick={() =>
                      onPriceChange && onPriceChange(active ? {} : { min: b.min, max: b.max })
                    }
                    className={
                      'text-left w-full hover:text-[#c7511f] ' +
                      (active ? 'font-bold text-[#c7511f]' : 'text-gray-700')
                    }
                  >
                    {b.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {(activeCategoryId || minPrice !== undefined || maxPrice !== undefined) && (
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:text-[#c7511f] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </aside>
  )
}
