import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  Mail,
  HelpCircle,
  Settings as SettingsIcon,
  Search,
  Grid3x3,
  ChevronDown,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSellerNotifications } from '../../hooks/useSellerNotifications'
import { getUnreadMessageCount } from '../../services/sellerService'

export const TYPE_ICONS = {
  new_order: '🛒',
  low_inventory: '⚠️',
  product_suppressed: '🚫',
  customer_message: '✉️',
  return_requested: '↩️',
  payment_update: '💵',
  policy: '📋',
  campaign_update: '📣',
}

export default function SellerHeader({ onToggleSidebar, sidebarCollapsed, onOpenMobileMenu }) {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const menuRef = useRef(null)
  const bellRef = useRef(null)
  const { notifications, unreadCount, markAllRead } = useSellerNotifications()
  const [unreadMessages, setUnreadMessages] = useState(0)

  const firstName =
    profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Seller'

  useEffect(() => {
    if (!user) return
    let cancelled = false
    function load() {
      getUnreadMessageCount(user.id).then((count) => {
        if (!cancelled) setUnreadMessages(count)
      })
    }
    load()
    const interval = setInterval(load, 30000)
    window.addEventListener('focus', load)
    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener('focus', load)
    }
  }, [user])

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('[signOut]', err)
    }
  }

  const recent = notifications.slice(0, 6)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-bone-50/95 backdrop-blur border-b border-stone-200">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-full">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-lg text-charcoal-600 hover:bg-stone-100 transition-avenzo"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-lg text-charcoal-500 hover:bg-stone-100 hover:text-charcoal-800 transition-avenzo"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-[18px] h-[18px]" />
          ) : (
            <PanelLeftClose className="w-[18px] h-[18px]" />
          )}
        </button>

        {/* Brand */}
        <Link to="/seller" className="flex items-center gap-2 flex-shrink-0 mr-1">
          <span className="w-8 h-8 rounded-lg bg-charcoal-900 text-brass-300 font-display font-semibold text-sm flex items-center justify-center">
            A
          </span>
          <span className="hidden sm:flex items-baseline gap-1.5 font-display text-[1.05rem] text-charcoal-900 leading-none">
            Avenzo
            <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.08em] text-charcoal-400">
              Seller Central
            </span>
          </span>
        </Link>

        {/* Search */}
        <div
          className={
            'hidden md:flex flex-1 max-w-xl items-center gap-2 rounded-lg border bg-stone-50 px-3 py-2 transition-avenzo ' +
            (searchFocused ? 'border-brass-400 bg-bone-50 shadow-focus-ring' : 'border-stone-200')
          }
        >
          <Search className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search orders, products, reports…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 bg-transparent text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none"
          />
          <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono text-charcoal-400 bg-bone-100 border border-stone-200 rounded px-1.5 py-0.5">
            /
          </kbd>
        </div>

        {/* Right icons */}
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen((o) => !o)}
              className="relative p-2 rounded-lg text-charcoal-500 hover:bg-stone-100 hover:text-charcoal-800 transition-avenzo"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-brass-500 text-bone-50 text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-bone-50 text-charcoal-800 rounded-xl shadow-popover border border-stone-200 z-50 overflow-hidden animate-scale-in origin-top-right">
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
                  <span className="font-semibold text-charcoal-900">Notifications</span>
                  <button
                    onClick={async () => {
                      await markAllRead()
                      setBellOpen(false)
                    }}
                    className="text-xs font-medium text-brass-600 hover:text-brass-700 transition-avenzo"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {recent.length === 0 ? (
                    <div className="p-6 text-center text-body-sm">You're all caught up.</div>
                  ) : (
                    <ul className="divide-y divide-stone-100">
                      {recent.map((n) => (
                        <li key={n.id}>
                          <Link
                            to={n.link || '/seller'}
                            onClick={() => setBellOpen(false)}
                            className={
                              'flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-avenzo ' +
                              (!n.read && !n.derived ? 'bg-brass-50/50' : '')
                            }
                          >
                            <span className="text-lg flex-shrink-0 leading-none mt-0.5">
                              {TYPE_ICONS[n.type] || '🔔'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div
                                className={
                                  'text-sm ' +
                                  (!n.read && !n.derived
                                    ? 'font-semibold text-charcoal-900'
                                    : 'font-medium text-charcoal-700')
                                }
                              >
                                {n.title}
                              </div>
                              {n.body && (
                                <div className="text-xs text-charcoal-500 line-clamp-2 mt-0.5">
                                  {n.body}
                                </div>
                              )}
                              <div className="text-[10px] text-charcoal-400 mt-1">
                                {new Date(n.created_at).toLocaleString()}
                              </div>
                            </div>
                            {!n.read && !n.derived && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brass-500 mt-1.5 flex-shrink-0" />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-stone-200 px-4 py-2.5 text-center bg-stone-50">
                  <Link
                    to="/seller/notifications"
                    onClick={() => setBellOpen(false)}
                    className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 transition-avenzo"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/seller/messages"
            className="hidden sm:flex relative p-2 rounded-lg text-charcoal-500 hover:bg-stone-100 hover:text-charcoal-800 transition-avenzo"
            aria-label="Inbox"
            title="Inbox"
          >
            <Mail className="w-[18px] h-[18px]" />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-brass-500 text-bone-50 text-[10px] font-bold flex items-center justify-center">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </Link>

          <Link
            to="/seller/help"
            className="hidden sm:flex p-2 rounded-lg text-charcoal-500 hover:bg-stone-100 hover:text-charcoal-800 transition-avenzo"
            aria-label="Help"
            title="Help"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </Link>

          <Link
            to="/seller/settings"
            className="hidden sm:flex p-2 rounded-lg text-charcoal-500 hover:bg-stone-100 hover:text-charcoal-800 transition-avenzo"
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon className="w-[18px] h-[18px]" />
          </Link>

          <Link
            to="/seller/apps-services"
            className="hidden md:flex p-2 rounded-lg text-charcoal-500 hover:bg-stone-100 hover:text-charcoal-800 transition-avenzo"
            aria-label="Apps & Services"
            title="Apps & Services"
          >
            <Grid3x3 className="w-[18px] h-[18px]" />
          </Link>

          {/* Account dropdown */}
          <div className="relative ml-1 sm:ml-2 pl-1 sm:pl-3 sm:border-l border-stone-200" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 px-1.5 sm:px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-avenzo"
            >
              <div className="w-7 h-7 rounded-full bg-charcoal-900 text-brass-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-charcoal-800 hidden md:inline">{firstName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 hidden md:inline" />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-bone-50 text-charcoal-800 rounded-xl shadow-popover border border-stone-200 z-50 overflow-hidden animate-scale-in origin-top-right">
                <div className="px-4 py-3 border-b border-stone-200">
                  <p className="text-sm font-medium text-charcoal-900 truncate">{firstName}</p>
                  <p className="text-xs text-charcoal-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/seller/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-100 transition-avenzo"
                  >
                    <User className="w-4 h-4 text-charcoal-400" /> Account Settings
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-100 transition-avenzo"
                  >
                    <ArrowLeft className="w-4 h-4 text-charcoal-400" /> Back to Avenzo
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-700 hover:bg-error-50 border-t border-stone-200 mt-1 pt-2 transition-avenzo"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
