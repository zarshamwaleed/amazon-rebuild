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
  Tag,
  Settings as SettingsIcon,
  ArrowRight,
  Check,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../services/supabase'

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
    bg: 'from-[#232f3e] to-[#37475a]',
  },
  {
    id: 'providers',
    name: 'Service Provider Network',
    description:
      'Find vetted third-party service providers for advertising, translation, taxes, photography, and design.',
    cta: 'Find providers',
    icon: Users,
    to: '/seller/apps-services/providers',
    bg: 'from-[#131921] to-[#232f3e]',
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
      <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white rounded-lg p-6 md:p-10">
        <div className="flex items-center gap-3 mb-3">
          <Grid3x3 className="w-7 h-7 text-[#febd69]" />
          <h1 className="text-2xl md:text-3xl font-bold">Apps & Services</h1>
        </div>
        <p className="text-gray-200 mb-6 max-w-2xl">
          Find tools and services to help grow your business — from Amazon-provided
          utilities to vetted third-party apps and providers.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-stretch rounded overflow-hidden max-w-xl"
        >
          <input
            type="text"
            placeholder="Search apps and services..."
            className="flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-900" />
          </button>
        </form>
      </div>

      {/* Amazon Tools */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Amazon Tools</h2>
          <Link
            to="/seller/apps-services/tools"
            className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1"
          >
            See all tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AMAZON_TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.id}
                to={tool.to}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gray-400 transition flex flex-col"
              >
                <div
                  className={
                    'w-11 h-11 rounded-lg bg-gradient-to-br ' +
                    tool.color +
                    ' flex items-center justify-center mb-3'
                  }
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">
                  {tool.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-3">{tool.description}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Explore Services */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Explore Services</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {EXPLORE_SERVICES.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.id}
                to={s.to}
                className={
                  'rounded-lg p-6 text-white bg-gradient-to-br ' +
                  s.bg +
                  ' hover:shadow-xl transition group relative overflow-hidden'
                }
              >
                <Icon className="w-9 h-9 text-[#febd69] mb-4" />
                <h3 className="text-lg font-bold mb-2">{s.name}</h3>
                <p className="text-sm text-gray-200 mb-5 pr-8">{s.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#febd69] group-hover:gap-3 transition-all">
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Apps</h2>
        <Link
          to="/seller/apps-services/manage"
          className="bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-4 hover:shadow-md transition"
        >
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <SettingsIcon className="w-6 h-6 text-[#c7511f]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">Manage Your Apps</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {connectedCount > 0
                ? `${connectedCount} app${connectedCount > 1 ? 's' : ''} connected to your seller account`
                : 'Review apps that have access to your seller account'}
            </p>
          </div>
          {connectedCount > 0 && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">
              {connectedCount} connected
            </span>
          )}
          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </Link>
      </section>

      {/* Recommended for You */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended for You</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {RECOMMENDED.map((r) => {
            const Icon = r.icon
            return (
              <Link
                key={r.name}
                to={r.to}
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md hover:border-gray-400 transition flex flex-col items-center"
              >
                <Icon className="w-6 h-6 text-[#c7511f] mb-2" />
                <div className="text-xs font-medium text-gray-900">{r.name}</div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}