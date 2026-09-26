import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Star } from 'lucide-react'
import { APPSTORE_CATEGORIES, APPS } from '../../../data/sellerApps'
import SellerPageHeader from '../../../components/seller/SellerPageHeader'
import Card from '../../../components/Card'
import EmptyState from '../../../components/EmptyState'

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
      <SellerPageHeader
        title="Selling Partner Appstore"
        description="Amazon-approved third-party software for every part of your business."
        backTo="/seller/apps-services"
      />

      {/* Search */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps by name, developer, or keyword..."
          className="flex-1 text-sm bg-transparent text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {APPSTORE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={
              'text-sm px-4 py-1.5 rounded-full border whitespace-nowrap transition-avenzo ' +
              (category === c
                ? 'bg-charcoal-900 text-bone-50 border-charcoal-900'
                : 'bg-bone-50 border-stone-300 text-charcoal-700 hover:border-stone-400')
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Filters sidebar */}
        <aside className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-5 h-fit self-start">
          <h3 className="heading-sub mb-4">Filters</h3>

          <div className="mb-5">
            <h4 className="text-label mb-2">Category</h4>
            <ul className="space-y-1 text-sm">
              {APPSTORE_CATEGORIES.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => setCategory(c)}
                    className={
                      'w-full text-left px-2 py-1 rounded-md hover:bg-stone-100 transition-avenzo ' +
                      (category === c ? 'text-brass-700 font-medium' : 'text-charcoal-700')
                    }
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-label mb-2">Minimum rating</h4>
            <ul className="space-y-1 text-sm">
              {[0, 4, 4.5].map((r) => (
                <li key={r}>
                  <label className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-stone-100 cursor-pointer transition-avenzo">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r}
                      onChange={() => setMinRating(r)}
                    />
                    {r === 0 ? (
                      'All ratings'
                    ) : (
                      <span className="flex items-center gap-1 text-charcoal-700">
                        <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" />
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
            <h2 className="heading-sub">{category === 'All' ? 'All apps' : category}</h2>
            <span className="text-caption">
              {filtered.length} app{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No apps found"
              message="Try a different category or search term."
            />
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
    <Link to={`/seller/apps-services/app/${app.id}`}>
      <Card hoverable className="h-full flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <div
            className={
              'w-12 h-12 rounded-lg bg-gradient-to-br ' + app.color + ' flex items-center justify-center flex-shrink-0 text-white font-bold text-lg'
            }
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-charcoal-900 text-sm truncate">{app.name}</h3>
            <p className="text-xs text-charcoal-500 truncate">{app.developer}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" />
              <span className="text-xs font-medium text-charcoal-900">{app.rating.toFixed(1)}</span>
              <span className="text-xs text-charcoal-500">({app.reviews.toLocaleString()})</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-charcoal-500 mb-2">{app.category}</div>
        <p className="text-xs text-charcoal-600 line-clamp-3 mb-3 flex-1">{app.description}</p>

        <div className="text-xs font-semibold text-charcoal-900 border-t border-stone-200 pt-3">
          {app.price}
        </div>
      </Card>
    </Link>
  )
}
