import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  User,
  Package,
  RotateCcw,
  Heart,
  Ticket,
  MessageSquare,
  LogOut,
  History,
  RefreshCw,
  Gift,
  HelpCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const SIGNED_IN_LINKS = [
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

export default function HeaderAccount() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const rootRef = useRef(null)

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    null

  const initial = (firstName?.[0] || 'A').toUpperCase()

  useEffect(() => {
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  async function handleSignOut() {
    try {
      await signOut()
      setOpen(false)
      navigate('/')
    } catch (err) {
      console.error('[signOut]', err)
    }
  }

  return (
    <div ref={rootRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          'flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full transition-avenzo ' +
          (open ? 'bg-stone-100' : 'hover:bg-stone-100')
        }
      >
        <span className="w-8 h-8 rounded-full bg-charcoal-900 text-bone-50 flex items-center justify-center font-display text-sm flex-shrink-0">
          {initial}
        </span>
        <span className="hidden lg:flex flex-col items-start leading-tight">
          <span className="text-caption">{user ? 'Hello,' : 'Welcome'}</span>
          <span className="text-body-sm font-medium text-charcoal-900 flex items-center gap-1">
            {user ? firstName : 'Sign in'}
            <ChevronDown
              className={'w-3.5 h-3.5 text-charcoal-400 transition-transform duration-base ' + (open ? 'rotate-180' : '')}
            />
          </span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full pt-2 w-72 z-50 animate-scale-in origin-top-right"
        >
          <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-popover overflow-hidden">
            {!user ? (
              <div className="p-5 border-b border-stone-200 bg-stone-50">
                <p className="heading-sub mb-3">Welcome to Avenzo</p>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center bg-charcoal-900 text-bone-50 text-sm font-medium py-2.5 rounded-full hover:bg-charcoal-800 transition-avenzo"
                >
                  Sign in
                </Link>
                <p className="text-caption mt-3 text-center">
                  New here?{' '}
                  <Link to="/register" onClick={() => setOpen(false)} className="text-brass-600 hover:text-brass-700 font-medium">
                    Create an account
                  </Link>
                </p>
              </div>
            ) : (
              <div className="px-5 py-4 border-b border-stone-200 bg-stone-50">
                <p className="text-caption">Signed in as</p>
                <p className="text-body font-medium text-charcoal-900 truncate">
                  {profile?.full_name || user.email}
                </p>
              </div>
            )}

            <div className="py-2">
              {user ? (
                SIGNED_IN_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-body-sm text-charcoal-700 hover:bg-stone-100 hover:text-charcoal-900 transition-avenzo"
                  >
                    <link.icon className="w-4 h-4 text-charcoal-400" />
                    {link.label}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    to="/wishlist"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-body-sm text-charcoal-700 hover:bg-stone-100 hover:text-charcoal-900 transition-avenzo"
                  >
                    <Heart className="w-4 h-4 text-charcoal-400" />
                    Your Wishlist
                  </Link>
                  <Link
                    to="/customer-service"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-body-sm text-charcoal-700 hover:bg-stone-100 hover:text-charcoal-900 transition-avenzo"
                  >
                    <MessageSquare className="w-4 h-4 text-charcoal-400" />
                    Customer Service
                  </Link>
                </>
              )}
            </div>

            {user && (
              <div className="border-t border-stone-200 py-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-body-sm text-charcoal-700 hover:bg-stone-100 hover:text-error-700 transition-avenzo"
                >
                  <LogOut className="w-4 h-4 text-charcoal-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
