import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, ArrowLeft, MapPin, Users, Check } from 'lucide-react'
import { PROVIDER_CATEGORIES, COUNTRIES, PROVIDERS } from '../../../data/serviceProviders'
import { useToast } from '../../../context/ToastContext'

export default function Providers() {
  const { pushToast } = useToast()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [country, setCountry] = useState('All countries')
  const [minRating, setMinRating] = useState(0)

  const filtered = useMemo(() => {
    return PROVIDERS.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (country !== 'All countries' && p.country !== country) return false
      if (p.rating < minRating) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [category, country, minRating, query])

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
            Service Provider Network
          </h1>
          <p className="text-sm text-gray-600">
            Hire vetted third-party experts to help run your business.
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
          placeholder="Search providers by name, specialty, or keyword..."
          className="flex-1 text-sm focus:outline-none"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {PROVIDER_CATEGORIES.map((c) => (
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
              Service type
            </h4>
            <ul className="space-y-1 text-sm max-h-48 overflow-y-auto">
              {PROVIDER_CATEGORIES.map((c) => (
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

          <div className="mb-5">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Country
            </h4>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
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

        {/* Provider grid */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {category === 'All' ? 'All providers' : category}
            </h2>
            <span className="text-sm text-gray-500">
              {filtered.length} provider{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                No providers match your filters
              </h3>
              <p className="text-sm text-gray-600">
                Try a different category, country, or clear the search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onContact={() =>
                    pushToast(`Contact request sent to ${p.name}`, {
                      type: 'success',
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProviderCard({ provider, onContact }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#232f3e] to-[#37475a] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
          {provider.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm truncate">
            {provider.name}
          </h3>
          <div className="text-xs text-gray-500 mt-0.5">
            {provider.category}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-3.5 h-3.5 fill-[#ffa41c] text-[#ffa41c]" />
            <span className="text-xs font-medium text-gray-900">
              {provider.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({provider.reviews} reviews)
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <MapPin className="w-3 h-3" />
            {provider.country}
          </div>
        </div>
        {provider.featured && (
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#febd69] text-gray-900 flex-shrink-0">
            Featured
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 line-clamp-2 mb-3">{provider.tagline}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {provider.services.slice(0, 3).map((s) => (
          <span
            key={s}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
          >
            {s}
          </span>
        ))}
        {provider.services.length > 3 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            +{provider.services.length - 3} more
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500 mb-4">
        Starting at <strong className="text-gray-900">{provider.startingPrice}</strong>
      </div>

      <div className="flex gap-2 mt-auto pt-3 border-t">
        <button
          onClick={onContact}
          className="flex-1 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium py-2 rounded text-sm transition"
        >
          Contact Provider
        </button>
        <button
          onClick={onContact}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded text-sm"
        >
          View Profile
        </button>
      </div>
    </div>
  )
}