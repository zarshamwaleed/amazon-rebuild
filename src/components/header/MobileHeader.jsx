import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Search, X, User } from 'lucide-react'
import SearchBar from '../SearchBar'
import { useAuth } from '../../context/AuthContext'
import CartButton from './CartButton'

export default function MobileHeader({ menuOpen, onOpenMenu }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="lg:hidden">
      <div className="flex items-center gap-1 px-3 py-2.5">
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="group p-2.5 -ml-1.5 rounded-full hover:bg-stone-100 transition-avenzo"
        >
          <Menu className="w-5 h-5 text-charcoal-900 transition-transform duration-fast group-hover:scale-110" />
        </button>

        <Link to="/" className="flex-1 text-center">
          <span className="font-display text-2xl font-medium text-charcoal-900">Avenzo</span>
        </Link>

        <button
          onClick={() => setSearchOpen((v) => !v)}
          aria-label={searchOpen ? 'Close search' : 'Open search'}
          aria-expanded={searchOpen}
          className="group p-2.5 rounded-full hover:bg-stone-100 transition-avenzo"
        >
          {searchOpen ? (
            <X className="w-5 h-5 text-charcoal-900 transition-transform duration-fast group-hover:scale-110" />
          ) : (
            <Search className="w-5 h-5 text-charcoal-900 transition-transform duration-fast group-hover:scale-110" />
          )}
        </button>

        <Link
          to={user ? '/account' : '/login'}
          aria-label="Account"
          className="group p-2.5 rounded-full hover:bg-stone-100 transition-avenzo"
        >
          <User className="w-5 h-5 text-charcoal-900 transition-transform duration-fast group-hover:scale-110" />
        </Link>

        <CartButton compact />
      </div>

      {searchOpen && (
        <div className="px-3 pb-3 animate-fade-in-up">
          <SearchBar variant="compact" autoFocus onNavigate={() => setSearchOpen(false)} />
        </div>
      )}
    </div>
  )
}
