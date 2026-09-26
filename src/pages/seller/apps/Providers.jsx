import { useMemo, useState } from 'react'
import { Search, Star, MapPin, Users } from 'lucide-react'
import { PROVIDER_CATEGORIES, COUNTRIES, PROVIDERS } from '../../../data/serviceProviders'
import { useToast } from '../../../context/ToastContext'
import SellerPageHeader from '../../../components/seller/SellerPageHeader'
import Card from '../../../components/Card'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'

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
      <SellerPageHeader
        title="Service Provider Network"
        description="Hire vetted third-party experts to help run your business."
        backTo="/seller/apps-services"
      />

      {/* Search */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search providers by name, specialty, or keyword..."
          className="flex-1 text-sm bg-transparent text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {PROVIDER_CATEGORIES.map((c) => (
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
            <h4 className="text-label mb-2">Service type</h4>
            <ul className="space-y-1 text-sm max-h-48 overflow-y-auto">
              {PROVIDER_CATEGORIES.map((c) => (
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

          <div className="mb-5">
            <h4 className="text-label mb-2">Country</h4>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3 py-2 text-sm text-charcoal-800 focus:outline-none focus:border-brass-400 transition-avenzo"
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
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

        {/* Provider grid */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="heading-sub">{category === 'All' ? 'All providers' : category}</h2>
            <span className="text-caption">
              {filtered.length} provider{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No providers match your filters"
              message="Try a different category, country, or clear the search."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onContact={() => pushToast(`Contact request sent to ${p.name}`, { type: 'success' })}
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
    <Card className="h-full flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-charcoal-900 flex items-center justify-center flex-shrink-0 text-brass-300 font-semibold text-sm">
          {provider.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-charcoal-900 text-sm truncate">{provider.name}</h3>
          <div className="text-xs text-charcoal-500 mt-0.5">{provider.category}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" />
            <span className="text-xs font-medium text-charcoal-900">{provider.rating.toFixed(1)}</span>
            <span className="text-xs text-charcoal-500">({provider.reviews} reviews)</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-charcoal-500 mt-0.5">
            <MapPin className="w-3 h-3" />
            {provider.country}
          </div>
        </div>
        {provider.featured && (
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-brass-400 text-charcoal-900 flex-shrink-0">
            Featured
          </span>
        )}
      </div>

      <p className="text-sm text-charcoal-700 line-clamp-2 mb-3">{provider.tagline}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {provider.services.slice(0, 3).map((s) => (
          <span key={s} className="text-xs bg-stone-100 text-charcoal-700 px-2 py-0.5 rounded-md">
            {s}
          </span>
        ))}
        {provider.services.length > 3 && (
          <span className="text-xs bg-stone-100 text-charcoal-500 px-2 py-0.5 rounded-md">
            +{provider.services.length - 3} more
          </span>
        )}
      </div>

      <div className="text-xs text-charcoal-500 mb-4">
        Starting at <strong className="text-charcoal-900 font-medium">{provider.startingPrice}</strong>
      </div>

      <div className="flex gap-2 mt-auto pt-3 border-t border-stone-200">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onContact}>
          Contact Provider
        </Button>
        <Button variant="outline" size="sm" onClick={onContact}>
          View Profile
        </Button>
      </div>
    </Card>
  )
}
