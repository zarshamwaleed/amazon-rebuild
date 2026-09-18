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
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSellerNotifications } from '../../hooks/useSellerNotifications'

const TYPE_ICONS = {
  new_order: '🛒',
  low_inventory: '⚠️',
  product_suppressed: '🚫',
  customer_message: '✉️',
  return_requested: '↩️',
  payment_update: '💵',
  policy: '📋',
  campaign_update: '📣',
}

export default function SellerHeader({ onToggleSidebar, sidebarOpen }) {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const menuRef = useRef(null)
  const bellRef = useRef(null)
  const { notifications, unreadCount, markAllRead } = useSellerNotifications()

  const firstName =
    profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Seller'

  // Close dropdowns on outside click
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
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#232f3e] text-white h-[52px]">
      <div className="flex items-center gap-3 px-3 py-2.5 h-full">
        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-white/10"
          aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
        </button>

        {/* Logo */}
        <Link to="/seller" className="flex items-center gap-1 flex-shrink-0">
          <span className="text-white text-lg font-bold">amazon</span>
          <span className="text-[#ff9900] text-lg font-bold">seller central</span>
        </Link>

        {/* Search */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="hidden md:flex flex-1 max-w-2xl items-center bg-white/10 border border-white/20 rounded overflow-hidden"
        >
          <Search className="w-4 h-4 ml-3 text-gray-300" />
          <input
            type="text"
            placeholder="Search Seller Central..."
            className="flex-1 bg-transparent text-sm px-3 py-1.5 placeholder-gray-400 focus:outline-none"
          />
        </form>

        {/* Right icons */}
        <div className="ml-auto flex items-center gap-1">
          {/* Bell dropdown */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen((o) => !o)}
              className="relative p-2 rounded hover:bg-white/10"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#febd69] text-gray-900 text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-full mt-1 w-96 bg-white text-gray-800 rounded shadow-xl border border-gray-200 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-bold text-gray-900">Notifications</span>
                  <button
                    onClick={async () => {
                      await markAllRead()
                      setBellOpen(false)
                    }}
                    className="text-xs text-[#007185] hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {recent.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                      You're all caught up.
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {recent.map((n) => (
                        <li key={n.id}>
                          <Link
                            to={n.link || '/seller'}
                            onClick={() => setBellOpen(false)}
                            className={
                              'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 ' +
                              (!n.read && !n.derived ? 'bg-orange-50/40' : '')
                            }
                          >
                            <span className="text-lg flex-shrink-0">
                              {TYPE_ICONS[n.type] || '🔔'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div
                                className={
                                  'text-sm ' +
                                  (!n.read && !n.derived
                                    ? 'font-bold text-gray-900'
                                    : 'font-medium text-gray-800')
                                }
                              >
                                {n.title}
                              </div>
                              {n.body && (
                                <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                  {n.body}
                                </div>
                              )}
                              <div className="text-[10px] text-gray-400 mt-1">
                                {new Date(n.created_at).toLocaleString()}
                              </div>
                            </div>
                            {!n.read && !n.derived && (
                              <span className="w-2 h-2 rounded-full bg-[#c7511f] mt-1.5 flex-shrink-0" />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t px-4 py-2 text-center">
                  <Link
                    to="/seller/notifications"
                    onClick={() => setBellOpen(false)}
                    className="text-xs text-[#007185] hover:underline"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Inbox */}
          <Link
            to="/seller/messages"
            className="p-2 rounded hover:bg-white/10"
            aria-label="Inbox"
            title="Inbox"
          >
            <Mail className="w-5 h-5" />
          </Link>

          {/* Help */}
          <Link
            to="/seller/help"
            className="p-2 rounded hover:bg-white/10"
            aria-label="Help"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>

          {/* Settings */}
          <Link
            to="/seller/settings"
            className="p-2 rounded hover:bg-white/10"
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>

          {/* Apps */}
          <Link
  to="/seller/apps-services"
  className="p-2 rounded hover:bg-white/10 hidden sm:block"
  aria-label="Apps & Services"
  title="Apps & Services"
>
  <Grid3x3 className="w-5 h-5" />
</Link>

          {/* Account dropdown */}
          <div className="relative ml-2 pl-3 border-l border-white/20" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#febd69] text-gray-900 flex items-center justify-center text-xs font-bold">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm hidden md:inline">{firstName}</span>
              <ChevronDown className="w-3.5 h-3.5 hidden md:inline" />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white text-gray-800 rounded shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-gray-900">{firstName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/seller/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 text-gray-500" /> Account Settings
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    ← Back to Amazon
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 border-t mt-1 pt-2"
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