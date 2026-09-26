import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
  REGISTRY_TYPE_ICONS as TYPE_ICONS,
} from '../services/registryService'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import SectionHeader from '../components/SectionHeader'
import Reveal from '../components/home/Reveal'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1800&q=80'

export default function RegistryLanding() {
  const { user } = useAuth()

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
    <div>
      {/* Hero */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden">
        <div className="relative min-h-[56vh] md:min-h-[70vh] flex items-end md:items-center">
          <Reveal variant="scale" className="absolute inset-0" delay={0}>
            <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/45 to-charcoal-900/10 md:bg-gradient-to-r md:from-charcoal-900/85 md:via-charcoal-900/40 md:to-transparent" />
          </Reveal>

          <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 sm:px-8 pb-12 md:pb-0">
            <div className="max-w-xl">
              <Reveal delay={80}>
                <span className="text-av-label uppercase tracking-wide font-medium text-brass-200 inline-flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Amazon Rebuild Registry
                </span>
              </Reveal>

              <Reveal as="h1" delay={200} className="mt-4">
                <span className="font-display font-medium text-bone-50 text-4xl sm:text-5xl lg:text-display leading-[1.06] tracking-tight">
                  Gifts, gathered with intention.
                </span>
              </Reveal>

              <Reveal delay={320} className="mt-5 max-w-md">
                <p className="text-av-body-lg text-bone-100/90">
                  Build a registry for your wedding, baby, birthday, or any
                  milestone worth celebrating — and let the people who love
                  you give exactly what you'll use.
                </p>
              </Reveal>

              <Reveal delay={440} className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/registry/create"
                  className="group inline-flex items-center gap-2 bg-brass-400 hover:bg-brass-300 text-charcoal-900 font-medium text-sm px-6 h-12 rounded-lg transition-avenzo active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" /> Create a Registry
                </Link>
                <Link
                  to="/registry/search"
                  className="inline-flex items-center gap-2 border border-bone-50/70 hover:bg-bone-50 hover:text-charcoal-900 text-bone-50 font-medium text-sm px-6 h-12 rounded-lg transition-avenzo active:scale-[0.98]"
                >
                  <Search className="w-4 h-4" /> Find a Registry
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-12 md:pt-16 space-y-16 md:space-y-20 pb-4">
        {/* Your registries */}
        {user && (
          <section>
            <SectionHeader
              title="Your Registries"
              subtitle="Pick up where you left off, or manage everything in one place."
              seeMoreTo="/registry/manage"
              ctaLabel="Manage all"
            />

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton-shimmer h-40 rounded-xl" />
                ))}
              </div>
            ) : myRegistries.length === 0 ? (
              <EmptyState
                icon={Gift}
                title="You haven't created a registry yet"
                message="Create a registry to start saving products for your special occasion."
                action={
                  <Link to="/registry/create">
                    <Button>
                      <Plus className="w-4 h-4" /> Create a Registry
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRegistries.slice(0, 3).map((r, i) => (
                  <Reveal key={r.id} delay={i * 80}>
                    <RegistryMiniCard registry={r} />
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Create a registry — type cards */}
        <section>
          <SectionHeader
            title="Create a Registry"
            subtitle="Choose the type of registry you'd like to create."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REGISTRY_TYPES.map((t, i) => {
              const Icon = TYPE_ICONS[t.id] || Gift
              return (
                <Reveal key={t.id} delay={i * 80}>
                  <Link
                    to={`/registry/create?type=${t.id}`}
                    className="group block h-full bg-bone-50 border border-stone-200 rounded-xl p-6 shadow-subtle hover:shadow-soft hover:border-stone-300 transition-avenzo"
                  >
                    <div className="w-12 h-12 rounded-full bg-brass-50 flex items-center justify-center mb-5 transition-avenzo group-hover:bg-brass-100">
                      <Icon className="w-5 h-5 text-brass-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="heading-sub mb-1.5">{t.name}</h3>
                    <p className="text-body-sm mb-5">{t.tagline}</p>
                    <span className="inline-flex items-center gap-1.5 text-av-label uppercase tracking-wide text-brass-700 group-hover:gap-2.5 transition-all">
                      Create Registry <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* Find a registry teaser */}
        <Reveal as="section" className="bg-stone-100 border border-stone-200 rounded-2xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-bone-50 border border-stone-200 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-charcoal-700" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="heading-section mb-1">
                  Looking for someone's registry?
                </h2>
                <p className="text-body-sm">
                  Search by name, city, or state to find a registry shared by
                  friends or family.
                </p>
              </div>
            </div>
            <Link to="/registry/search" className="shrink-0">
              <Button variant="secondary" size="lg">
                Find a Registry
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* Why use registries */}
        <section className="grid sm:grid-cols-3 gap-5">
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
          ].map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal key={f.title} delay={i * 80} className="bg-bone-50 border border-stone-200 rounded-xl p-6">
                <Icon className="w-6 h-6 text-brass-600 mb-3" strokeWidth={1.5} />
                <h3 className="heading-sub mb-1">{f.title}</h3>
                <p className="text-body-sm">{f.desc}</p>
              </Reveal>
            )
          })}
        </section>
      </div>
    </div>
  )
}

function RegistryMiniCard({ registry }) {
  const date = registry.expected_date || registry.event_date
  const Icon = TYPE_ICONS[registry.type] || Gift

  return (
    <div className="h-full bg-bone-50 border border-stone-200 rounded-xl p-5 flex flex-col shadow-subtle transition-avenzo hover:shadow-soft hover:border-stone-300">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-full bg-brass-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-brass-600" strokeWidth={1.5} />
        </div>
        <span className="text-av-label uppercase tracking-wide text-charcoal-500">
          {registry.type}
        </span>
      </div>
      <h3 className="heading-sub mb-1 line-clamp-1">{registry.name}</h3>
      {date && (
        <div className="text-caption flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {new Date(date).toLocaleDateString()}
        </div>
      )}
      {registry.city && (
        <div className="text-caption flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" /> {registry.city}
          {registry.state ? ', ' + registry.state : ''}
        </div>
      )}
      <div className="flex gap-2 mt-4 pt-4 border-t border-stone-200">
        <Link to={`/registry/${registry.id}`} className="flex-1">
          <Button size="sm" variant="secondary" className="w-full">
            View
          </Button>
        </Link>
        <Link to={`/registry/${registry.id}/edit`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">
            Edit
          </Button>
        </Link>
      </div>
    </div>
  )
}
