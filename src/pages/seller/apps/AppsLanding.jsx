import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Grid3x3,
  Bot,
  TrendingUp,
  Calculator,
  GraduationCap,
  Rocket,
  Store,
  Users,
  Package,
  Megaphone,
  DollarSign,
  BarChart3,
  Settings as SettingsIcon,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../services/supabase'
import Card from '../../../components/Card'
import Badge from '../../../components/Badge'

const AMAZON_TOOLS = [
  {
    id: 'seller-app',
    name: 'Amazon Seller App',
    description: 'Manage your business from your phone — listings, orders, and messages on the go.',
    icon: Bot,
    color: 'from-blue-500 to-indigo-600',
    to: '/seller/apps-services/tools',
  },
  {
    id: 'automate-pricing',
    name: 'Automate Pricing',
    description: 'Adjust prices automatically based on rules and competitor pricing.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    to: '/seller/pricing/automate',
  },
  {
    id: 'fba-calc',
    name: 'FBA Revenue Calculator',
    description: 'Estimate fees and profits before you send inventory to fulfillment centers.',
    icon: Calculator,
    color: 'from-amber-500 to-orange-600',
    to: '/seller/apps-services/tools',
  },
  {
    id: 'seller-uni',
    name: 'Seller University',
    description: 'Free training videos and guides to help you grow your business.',
    icon: GraduationCap,
    color: 'from-purple-500 to-fuchsia-600',
    to: '/seller/apps-services/tools',
  },
  {
    id: 'growth',
    name: 'Growth Opportunities',
    description: 'Personalized recommendations to improve listings and increase sales.',
    icon: Rocket,
    color: 'from-rose-500 to-pink-600',
    to: '/seller/growth',
  },
]

const EXPLORE_SERVICES = [
  {
    id: 'appstore',
    name: 'Selling Partner Appstore',
    description:
      'Discover Amazon-approved third-party software for inventory, orders, accounting, advertising, and more.',
    cta: 'Browse Appstore',
    icon: Store,
    to: '/seller/apps-services/appstore',
  },
  {
    id: 'providers',
    name: 'Service Provider Network',
    description:
      'Find vetted third-party service providers for advertising, translation, taxes, photography, and design.',
    cta: 'Find providers',
    icon: Users,
    to: '/seller/apps-services/providers',
  },
]

const RECOMMENDED = [
  { name: 'Inventory Management', icon: Package, to: '/seller/apps-services/appstore?category=Inventory' },
  { name: 'Advertising', icon: Megaphone, to: '/seller/apps-services/appstore?category=Advertising' },
  { name: 'Accounting', icon: DollarSign, to: '/seller/apps-services/appstore?category=Accounting' },
  { name: 'Product Research', icon: Search, to: '/seller/apps-services/appstore?category=Product%20Research' },
  { name: 'Repricing', icon: TrendingUp, to: '/seller/apps-services/appstore?category=Pricing' },
  { name: 'Analytics', icon: BarChart3, to: '/seller/apps-services/appstore?category=Analytics' },
]

export default function AppsLanding() {
  const { user } = useAuth()
  const [connectedCount, setConnectedCount] = useState(0)

  // Count connected apps for the "Your Apps" tile
  useEffect(() => {
    if (!user) return
    let cancelled = false
    supabase
      .from('connected_apps')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .then(({ count }) => {
        if (!cancelled) setConnectedCount(count || 0)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-charcoal-900 text-bone-50 rounded-xl p-6 md:p-10">
        <div className="flex items-center gap-3 mb-3">
          <Grid3x3 className="w-6 h-6 text-brass-300" />
          <h1 className="font-display text-2xl md:text-3xl text-bone-50">Apps &amp; Services</h1>
        </div>
        <p className="text-charcoal-200 mb-6 max-w-2xl text-body-sm">
          Find tools and services to help grow your business — from Amazon-provided
          utilities to vetted third-party apps and providers.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-stretch rounded-lg overflow-hidden max-w-xl border border-white/10"
        >
          <input
            type="text"
            placeholder="Search apps and services..."
            className="flex-1 px-3.5 py-2.5 text-sm bg-bone-50 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-brass-400 hover:bg-brass-300 px-4 flex items-center justify-center transition-avenzo"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-charcoal-900" />
          </button>
        </form>
      </div>

      {/* Amazon Tools */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="heading-section">Amazon Tools</h2>
          <Link
            to="/seller/apps-services/tools"
            className="text-body-sm font-medium text-brass-600 hover:text-brass-700 transition-avenzo flex items-center gap-1"
          >
            See all tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AMAZON_TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.id} to={tool.to}>
                <Card hoverable className="h-full flex flex-col">
                  <div
                    className={
                      'w-11 h-11 rounded-lg bg-gradient-to-br ' + tool.color + ' flex items-center justify-center mb-3'
                    }
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-charcoal-900 mb-1 leading-snug">{tool.name}</h3>
                  <p className="text-xs text-charcoal-500 line-clamp-3">{tool.description}</p>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Explore Services */}
      <section>
        <h2 className="heading-section mb-4">Explore Services</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {EXPLORE_SERVICES.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.id}
                to={s.to}
                className="rounded-xl p-6 text-bone-50 bg-charcoal-900 hover:shadow-lifted transition-avenzo group relative overflow-hidden"
              >
                <Icon className="w-8 h-8 text-brass-300 mb-4" />
                <h3 className="font-display text-lg mb-2">{s.name}</h3>
                <p className="text-sm text-charcoal-300 mb-5 pr-8">{s.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-brass-300 group-hover:gap-3 transition-all">
                  {s.cta} <ArrowRight className="w-4 h-4" />
                </span>
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full" />
              </Link>
            )
          })}
        </div>
      </section>

      {/* Your Apps */}
      <section>
        <h2 className="heading-section mb-4">Your Apps</h2>
        <Link to="/seller/apps-services/manage">
          <Card hoverable>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-brass-50 flex items-center justify-center flex-shrink-0">
                <SettingsIcon className="w-6 h-6 text-brass-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-charcoal-900">Manage Your Apps</h3>
                <p className="text-body-sm mt-0.5">
                  {connectedCount > 0
                    ? `${connectedCount} app${connectedCount > 1 ? 's' : ''} connected to your seller account`
                    : 'Review apps that have access to your seller account'}
                </p>
              </div>
              {connectedCount > 0 && <Badge color="green">{connectedCount} connected</Badge>}
              <ArrowRight className="w-5 h-5 text-charcoal-300 flex-shrink-0" />
            </div>
          </Card>
        </Link>
      </section>

      {/* Recommended for You */}
      <section>
        <h2 className="heading-section mb-4">Recommended for You</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {RECOMMENDED.map((r) => {
            const Icon = r.icon
            return (
              <Link key={r.name} to={r.to}>
                <Card hoverable padding="sm" className="text-center flex flex-col items-center">
                  <Icon className="w-6 h-6 text-brass-600 mb-2" />
                  <div className="text-xs font-medium text-charcoal-800">{r.name}</div>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
