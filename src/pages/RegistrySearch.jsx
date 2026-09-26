import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search as SearchIcon,
  Gift,
  MapPin,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react'
import {
  searchRegistries,
  getRegistryTypeMeta,
  REGISTRY_TYPE_ICONS as TYPE_ICONS,
} from '../services/registryService'
import Button from '../components/Button'
import Input from '../components/Input'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/home/Reveal'

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
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        to="/registry"
        className="inline-flex items-center gap-1.5 text-body-sm hover:text-charcoal-900 transition-avenzo"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Registry
      </Link>

      <Reveal className="text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-brass-50 flex items-center justify-center mx-auto mb-4">
          <SearchIcon className="w-5 h-5 text-brass-600" strokeWidth={1.5} />
        </div>
        <h1 className="heading-display-sm">Find a Registry</h1>
        <p className="text-body mt-3">
          Search for a friend or family member's registry by name, city, or
          state — take your time, there's no rush.
        </p>
      </Reveal>

      {/* Search form */}
      <Reveal delay={80} as="form" onSubmit={handleSubmit} className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-6 md:p-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            value={form.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            placeholder="e.g. Sarah"
          />
          <Input
            label="Last name"
            value={form.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            placeholder="e.g. Johnson"
          />
          <Input
            label="City"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="e.g. Austin"
          />
          <Input
            label="State / Region"
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
            placeholder="e.g. TX"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          {searched && (
            <Button type="button" variant="ghost" onClick={reset}>
              Clear
            </Button>
          )}
          <Button type="submit" variant="secondary" loading={loading}>
            <SearchIcon className="w-4 h-4" /> {loading ? 'Searching…' : 'Search'}
          </Button>
        </div>
      </Reveal>

      {/* Search tips if not searched */}
      {!searched && (
        <Reveal delay={140} className="bg-info-50 border border-info-500/20 rounded-xl p-5">
          <h3 className="heading-sub text-info-700 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" /> Search tips
          </h3>
          <ul className="space-y-1.5 text-body-sm">
            <li>• Try different combinations — first name alone often works.</li>
            <li>• If you know the exact registry link, use it directly.</li>
            <li>
              • Private registries don't appear in search, but the owner can
              still share a link with you.
            </li>
          </ul>
        </Reveal>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="heading-section">Search Results</h2>
            {results && (
              <span className="text-caption">
                {results.length} registr{results.length === 1 ? 'y' : 'ies'} found
              </span>
            )}
          </div>

          {results && results.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No registries found"
              message="Try a different name or location. Some registries can only be viewed by people who have the direct link."
              action={
                <Link to="/registry">
                  <Button>Back to Registry</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {results?.map((r, i) => (
                <Reveal key={r.id} delay={i * 60}>
                  <RegistryResultCard registry={r} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RegistryResultCard({ registry }) {
  const meta = getRegistryTypeMeta(registry.type)
  const Icon = TYPE_ICONS[registry.type] || Gift
  const date = registry.expected_date || registry.event_date
  const ownerName = [registry.owner_first_name, registry.owner_last_name]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="bg-bone-50 border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row gap-4 shadow-subtle transition-avenzo hover:shadow-soft hover:border-stone-300">
      <div className="w-14 h-14 rounded-xl bg-brass-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-brass-600" strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-av-label uppercase tracking-wide text-charcoal-500 mb-1">
          {meta.name}
        </div>
        <h3 className="heading-sub">{registry.name}</h3>
        {ownerName && <div className="text-body-sm mt-0.5">{ownerName}</div>}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {date && (
            <span className="text-caption flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(date).toLocaleDateString()}
            </span>
          )}
          {registry.show_location && registry.city && (
            <span className="text-caption flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {registry.city}
              {registry.state ? ', ' + registry.state : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex items-end md:items-center">
        <Link to={`/registry/${registry.id}`}>
          <Button size="sm" variant="secondary">
            View Registry <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
