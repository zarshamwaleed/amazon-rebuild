import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search as SearchIcon,
  Gift,
  MapPin,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import {
  searchRegistries,
  REGISTRY_TYPES,
  getRegistryTypeMeta,
} from '../services/registryService'

export default function RegistrySearch() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    city: '',
    state: '',
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    try {
      const r = await searchRegistries(form)
      setResults(r)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setForm({ firstName: '', lastName: '', city: '', state: '' })
    setResults(null)
    setSearched(false)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <Link
        to="/registry"
        className="text-sm text-[#007185] hover:underline"
      >
        ← Back to Registry
      </Link>

      <div className="bg-gradient-to-br from-[#232f3e] to-[#131921] text-white rounded-lg p-8 md:p-10">
        <SearchIcon className="w-8 h-8 text-[#febd69] mb-3" />
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Find a Registry</h1>
        <p className="text-gray-200">
          Search for a friend or family member's registry by name, city, or state.
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="First name">
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              placeholder="e.g. Sarah"
              className="input"
            />
          </Field>
          <Field label="Last name">
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              placeholder="e.g. Johnson"
              className="input"
            />
          </Field>
          <Field label="City">
            <input
              type="text"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="e.g. Austin"
              className="input"
            />
          </Field>
          <Field label="State / Region">
            <input
              type="text"
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              placeholder="e.g. TX"
              className="input"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {searched && (
            <button
              type="button"
              onClick={reset}
              className="px-5 py-2.5 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2.5 rounded flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Searching…
              </>
            ) : (
              <>
                <SearchIcon className="w-4 h-4" /> Search
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && !loading && (
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
            {results && (
              <span className="text-sm text-gray-500">
                {results.length} registr{results.length === 1 ? 'y' : 'ies'} found
              </span>
            )}
          </div>

          {results && results.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No registries found
              </h3>
              <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
                Try a different name or location. Some registries can only be
                viewed by people who have the direct link.
              </p>
              <Link
                to="/registry"
                className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
              >
                Back to Registry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {results?.map((r) => (
                <RegistryResultCard key={r.id} registry={r} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search tips if not searched */}
      {!searched && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="font-bold text-blue-900 mb-2">Search tips</h3>
          <ul className="space-y-1.5 text-sm text-blue-800">
            <li>• Try different combinations — first name alone often works.</li>
            <li>• If you know the exact registry link, use it directly.</li>
            <li>
              • Private registries don't appear in search, but the owner can
              still share a link with you.
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

function RegistryResultCard({ registry }) {
  const meta = getRegistryTypeMeta(registry.type)
  const date = registry.expected_date || registry.event_date
  const ownerName = [registry.owner_first_name, registry.owner_last_name]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row gap-4 hover:shadow-md transition">
      <div
        className={
          'w-16 h-16 rounded-lg bg-gradient-to-br ' +
          meta.color +
          ' flex items-center justify-center text-3xl flex-shrink-0'
        }
      >
        {meta.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
          {meta.name}
        </div>
        <h3 className="font-bold text-gray-900 text-lg">{registry.name}</h3>
        {ownerName && (
          <div className="text-sm text-gray-700 mt-0.5">{ownerName}</div>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
          {date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(date).toLocaleDateString()}
            </span>
          )}
          {registry.show_location && registry.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {registry.city}
              {registry.state ? ', ' + registry.state : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex items-end md:items-center">
        <Link
          to={`/registry/${registry.id}`}
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-4 py-2 rounded flex items-center gap-2 text-sm transition"
        >
          View Registry <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}