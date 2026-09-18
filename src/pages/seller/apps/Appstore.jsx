import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Star, ArrowLeft } from 'lucide-react'
import { APPSTORE_CATEGORIES, APPS } from '../../../data/sellerApps'

export default function Appstore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || 'All'
  const [category, setCategory] = useState(
    APPSTORE_CATEGORIES.includes(categoryParam) ? categoryParam : 'All'
  )
  const [query, setQuery] = useState('')
  const [minRating, setMinRating] = useState(0)

  // Keep URL in sync when category changes
  useEffect(() => {
    if (category === 'All') {
      const next = new URLSearchParams(searchParams)
      next.delete('category')
      setSearchParams(next, { replace: true })
    } else {
      const next = new URLSearchParams(searchParams)
      next.set('category', category)
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const filtered = useMemo(() => {
    return APPS.filter((a) => {
      if (category !== 'All' && a.category !== category) return false
      if (a.rating < minRating) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return (
          a.name.toLowerCase().includes(q) ||
          a.developer.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [category, minRating, query])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/seller/apps-services"
          className="p-2 hover:bg-white rounded border border-gray-200"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Selling Partner Appstore
          </h1>
          <p className="text-sm text-gray-600">
            Amazon-approved third-party software for every part of your business.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps by name, developer, or keyword..."
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {APPSTORE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={
              'text-sm px-4 py-1.5 rounded-full border whitespace-nowrap transition ' +
              (category === c
                ? 'bg-[#232f3e] text-white border-[#232f3e]'
                : 'bg-white border-gray-300 hover:border-gray-500')
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Filters sidebar */}
        <aside className="bg-white border border-gray-200 rounded-lg p-5 h-fit self-start">
          <h3 className="font-bold text-gray-900 mb-4">Filters</h3>

          <div className="mb-5">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Category
            </h4>
            <ul className="space-y-1 text-sm">
              {APPSTORE_CATEGORIES.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => setCategory(c)}
                    className={
                      'w-full text-left px-2 py-1 rounded hover:bg-gray-100 ' +
                      (category === c ? 'text-[#c7511f] font-medium' : 'text-gray-700')
                    }
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Minimum rating
            </h4>
            <ul className="space-y-1 text-sm">
              {[0, 4, 4.5].map((r) => (
                <li key={r}>
                  <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r}
                      onChange={() => setMinRating(r)}
                    />
                    {r === 0 ? (
                      'All ratings'
                    ) : (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                        {r}+
                      </span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* App grid */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {category === 'All' ? 'All apps' : category}
            </h2>
            <span className="text-sm text-gray-500">
              {filtered.length} app{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">No apps found</h3>
              <p className="text-sm text-gray-600">
                Try a different category or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((a) => (
                <AppCard key={a.id} app={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AppCard({ app }) {
  const initials = app.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <Link
      to={`/seller/apps-services/app/${app.id}`}
      className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col hover:shadow-md hover:border-gray-400 transition"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={
            'w-12 h-12 rounded-lg bg-gradient-to-br ' + app.color + ' flex items-center justify-center flex-shrink-0 text-white font-bold text-lg'
          }
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm truncate">{app.name}</h3>
          <p className="text-xs text-gray-500 truncate">{app.developer}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-3.5 h-3.5 fill-[#ffa41c] text-[#ffa41c]" />
            <span className="text-xs font-medium text-gray-900">
              {app.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({app.reviews.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-2">{app.category}</div>
      <p className="text-xs text-gray-700 line-clamp-3 mb-3 flex-1">
        {app.description}
      </p>

      <div className="text-xs font-bold text-gray-900 border-t pt-3">
        {app.price}
      </div>
    </Link>
  )
}