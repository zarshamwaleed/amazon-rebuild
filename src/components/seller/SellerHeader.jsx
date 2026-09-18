import { useState, useRef, useEffect } from 'react'
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
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function SellerHeader({ onToggleSidebar, sidebarOpen }) {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const firstName =
    profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Seller'

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
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
          <button className="p-2 rounded hover:bg-white/10" aria-label="Notifications" title="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-white/10" aria-label="Inbox" title="Inbox">
            <Mail className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-white/10" aria-label="Help" title="Help">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-white/10" aria-label="Settings" title="Settings">
            <SettingsIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-white/10 hidden sm:block" aria-label="Apps" title="Apps & Services">
            <Grid3x3 className="w-5 h-5" />
          </button>

          <div className="relative ml-2 pl-3 border-l border-white/20" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition"
              aria-haspopup="menu"
              aria-expanded={open}
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