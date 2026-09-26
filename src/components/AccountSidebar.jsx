import { NavLink, useNavigate } from 'react-router-dom'
import { User, Package, Heart, LogOut, Mail, RotateCcw, Gift } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/orders', label: 'Your Orders', icon: Package },
  { to: '/wishlist', label: 'Your Wishlist', icon: Heart },
  { to: '/messages', label: 'Your Messages', icon: Mail },
  { to: '/returns', label: 'Your Returns', icon: RotateCcw },
  { to: '/gift-cards/balance', label: 'Gift Card Balance', icon: Gift },
]

export default function AccountSidebar() {
  const { signOut, profile, user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  }

  const initials = (profile?.full_name || user?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-bone-50 border border-stone-200 rounded-xl p-5 mb-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-charcoal-900 text-bone-50 flex items-center justify-center font-display text-lg flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-charcoal-900 truncate">
            {profile?.full_name || 'Your account'}
          </div>
          <div className="text-caption truncate">{profile?.email || user?.email}</div>
        </div>
      </div>

      <nav className="bg-bone-50 border border-stone-200 rounded-xl overflow-hidden">
        {links.map((l) => {
          const Icon = l.icon
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                'relative flex items-center gap-3 px-5 py-3.5 text-sm border-b border-stone-100 last:border-b-0 transition-avenzo ' +
                (isActive
                  ? 'text-charcoal-900 font-medium bg-brass-50'
                  : 'text-charcoal-600 hover:bg-stone-50 hover:text-charcoal-900')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brass-400" />}
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  {l.label}
                </>
              )}
            </NavLink>
          )
        })}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-5 py-3.5 text-sm w-full text-left text-charcoal-600 hover:bg-error-50 hover:text-error-700 transition-avenzo border-t border-stone-200"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          Sign Out
        </button>
      </nav>
    </aside>
  )
}
