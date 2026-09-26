import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  X,
  User,
  Package,
  RotateCcw,
  Heart,
  Ticket,
  MessageSquare,
  LogOut,
  Store,
  Gift,
  Clapperboard,
  Percent,
  History,
  RefreshCw,
  HelpCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useCategories from '../../hooks/useCategories'

const FEATURES = [
  { label: 'Prime Video', to: '/prime-video', icon: Clapperboard },
  { label: "Today's Deals", to: '/deals' },
  { label: 'Coupons', to: '/coupons', icon: Percent },
  { label: 'Gift Cards', to: '/gift-cards', icon: Gift },
  { label: 'Registry', to: '/registry' },
  { label: 'Sell on Avenzo', to: '/sell', icon: Store },
]

const ACCOUNT_LINKS = [
  { label: 'Your Account', to: '/account', icon: User },
  { label: 'Your Orders', to: '/orders', icon: Package },
  { label: 'Your Wishlist', to: '/wishlist', icon: Heart },
  { label: 'Your Coupons', to: '/coupons/my-coupons', icon: Ticket },
  { label: 'Your Returns', to: '/returns', icon: RotateCcw },
  { label: 'Your Messages', to: '/messages', icon: MessageSquare },
  { label: 'Browsing History', to: '/browsing-history', icon: History },
  { label: 'Buy Again', to: '/buy-again', icon: RefreshCw },
  { label: 'Gift Card Balance', to: '/gift-cards/balance', icon: Gift },
  { label: 'Customer Service', to: '/customer-service', icon: HelpCircle },
]

export default function MobileMenu({ open, onClose }) {
  const { user, profile, signOut } = useAuth()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const closeButtonRef = useRef(null)

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || null

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  async function handleSignOut() {
    try {
      await signOut()
      onClose()
      navigate('/')
    } catch (err) {
      console.error('[signOut]', err)
    }
  }

  return (
    <div
      className={'fixed inset-0 z-[60] ' + (open ? 'visible' : 'invisible pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={
          'absolute inset-0 bg-charcoal-900 transition-opacity duration-slow ease-avenzo-out ' +
          (open ? 'opacity-40' : 'opacity-0')
        }
      />

      <aside
        className={
          'relative bg-bone-50 w-[85vw] max-w-sm h-full shadow-lifted flex flex-col transition-transform duration-slow ease-avenzo-out ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
        id="mobile-menu"
        role="dialog"
        aria-modal={open}
        aria-label="Menu"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <span className="font-display text-2xl font-medium text-charcoal-900">Avenzo</span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close menu"
            className="group p-2 rounded-full hover:bg-stone-100 transition-avenzo"
          >
            <X className="w-5 h-5 text-charcoal-800 transition-transform duration-fast group-hover:scale-110" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="px-5 py-4 bg-stone-50 border-b border-stone-200">
            {user ? (
              <p className="text-body font-medium text-charcoal-900">
                Hello, {firstName}
              </p>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex-1 text-center bg-charcoal-900 text-bone-50 text-sm font-medium py-2.5 rounded-full hover:bg-charcoal-800 transition-avenzo"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="flex-1 text-center border border-stone-300 text-sm font-medium py-2.5 rounded-full hover:bg-stone-100 transition-avenzo"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="py-3 border-b border-stone-200">
            <h3 className="px-5 pb-2 text-label">Shop</h3>
            <Link
              to="/products"
              onClick={onClose}
              className="block px-5 py-2.5 text-body-sm font-medium text-charcoal-900 hover:bg-stone-100 transition-avenzo"
            >
              Shop All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={'/category/' + cat.slug}
                onClick={onClose}
                className="block px-5 py-2.5 text-body-sm text-charcoal-700 hover:bg-stone-100 transition-avenzo"
              >
                {cat.name}
              </Link>
            ))}
            {FEATURES.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-2.5 text-body-sm text-charcoal-700 hover:bg-stone-100 transition-avenzo"
              >
                {link.icon ? <link.icon className="w-4 h-4 text-charcoal-400" /> : <span className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {user && (
            <div className="py-3">
              <h3 className="px-5 pb-2 text-label">Your Account</h3>
              <nav>
                {ACCOUNT_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className="flex items-center gap-3 px-5 py-2.5 text-body-sm text-charcoal-700 hover:bg-stone-100 transition-avenzo"
                  >
                    <link.icon className="w-4 h-4 text-charcoal-400" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>

        {user && (
          <div className="border-t border-stone-200 p-3">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-2 py-2.5 text-body-sm text-charcoal-700 hover:text-error-700 transition-avenzo"
            >
              <LogOut className="w-4 h-4 text-charcoal-400" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
