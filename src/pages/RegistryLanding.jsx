import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Gift,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getMyRegistries,
  REGISTRY_TYPES,
} from '../services/registryService'

export default function RegistryLanding() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [myRegistries, setMyRegistries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    getMyRegistries(user.id)
      .then((r) => {
        if (!cancelled) setMyRegistries(r)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#131921] text-white rounded-lg p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-[#febd69]" />
            <span className="text-sm uppercase tracking-wider text-[#febd69] font-bold">
              Amazon Rebuild Registry
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Create a registry for your special occasion
          </h1>
          <p className="text-gray-200 text-lg mb-8">
            Build a wishlist for your wedding, baby, birthday, or any milestone —
            and share it with the people you love.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/registry/create"
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-semibold px-6 py-3 rounded flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Create a Registry
            </Link>
            <Link
              to="/registry/search"
              className="border border-white hover:bg-white hover:text-gray-900 text-white font-semibold px-6 py-3 rounded flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4" /> Find a Registry
            </Link>
          </div>
        </div>
      </section>

      {/* Your registries */}
      {user && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Registries</h2>
            <Link
              to="/registry/manage"
              className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
            >
              Manage all →
            </Link>
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-500">
              Loading your registries…
            </div>
          ) : myRegistries.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                You haven't created a registry yet
              </h3>
              <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
                Create a registry to save products for your special occasion.
              </p>
              <Link
                to="/registry/create"
                className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-5 py-2.5 rounded"
              >
                <Plus className="w-4 h-4" /> Create a Registry
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRegistries.slice(0, 3).map((r) => (
                <RegistryMiniCard key={r.id} registry={r} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Create a registry — type cards */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create a Registry
          </h2>
          <p className="text-gray-600">
            Choose the type of registry you'd like to create.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGISTRY_TYPES.map((t) => (
            <Link
              key={t.id}
              to={`/registry/create?type=${t.id}`}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition group flex flex-col"
            >
              <div
                className={
                  'aspect-[4/3] bg-gradient-to-br ' +
                  t.color +
                  ' flex items-center justify-center text-6xl'
                }
              >
                {t.emoji}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{t.name}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">{t.tagline}</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#007185] group-hover:gap-3 transition-all">
                  Create Registry <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Find a registry teaser */}
      <section className="bg-gray-50 border border-gray-200 rounded-lg p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Search className="w-10 h-10 text-[#c7511f] flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Looking for someone's registry?
              </h2>
              <p className="text-sm text-gray-600">
                Search by name, city, or state to find a registry shared by
                friends or family.
              </p>
            </div>
          </div>
          <Link
            to="/registry/search"
            className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-semibold px-6 py-3 rounded whitespace-nowrap transition"
          >
            Find a Registry
          </Link>
        </div>
      </section>

      {/* Why use registries */}
      <section className="grid md:grid-cols-3 gap-5">
        {[
          {
            icon: Sparkles,
            title: 'Pick anything you love',
            desc: 'Add products from across the Amazon Rebuild catalog to your registry.',
          },
          {
            icon: Gift,
            title: 'Easy to share',
            desc: 'Share with a link so friends and family can buy directly from your list.',
          },
          {
            icon: Calendar,
            title: 'Track every gift',
            desc: 'See what has been purchased and what remains as your big day approaches.',
          },
        ].map((f) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <Icon className="w-7 h-7 text-[#c7511f] mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}

function RegistryMiniCard({ registry }) {
  const date = registry.expected_date || registry.event_date
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">
          {REGISTRY_TYPES.find((t) => t.id === registry.type)?.emoji || '🎁'}
        </span>
        <span className="text-xs uppercase tracking-wider text-gray-500">
          {registry.type}
        </span>
      </div>
      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
        {registry.name}
      </h3>
      {date && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />{' '}
          {new Date(date).toLocaleDateString()}
        </div>
      )}
      {registry.city && (
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" /> {registry.city}
          {registry.state ? ', ' + registry.state : ''}
        </div>
      )}
      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Link
          to={`/registry/${registry.id}`}
          className="flex-1 text-center text-sm px-3 py-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium rounded transition"
        >
          View
        </Link>
        <Link
          to={`/registry/${registry.id}/edit`}
          className="flex-1 text-center text-sm px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded transition"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}