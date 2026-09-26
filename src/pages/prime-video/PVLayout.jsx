import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const NAV = [
  { label: 'Home', to: '/prime-video', end: true },
  { label: 'Movies', to: '/prime-video/movies' },
  { label: 'TV Shows', to: '/prime-video/tv' },
  { label: 'My Stuff', to: '/prime-video/my-stuff' },
]

export default function PVLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setSearchOpen(false)
    setQuery('')
  }, [location.pathname])

  function submit(e) {
    e.preventDefault()
    if (!query.trim()) return
    navigate('/prime-video/search?q=' + encodeURIComponent(query.trim()))
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <div className="pv-scope bg-[var(--ink)] text-[var(--bone)] -mx-3 sm:-mx-4 -my-6">
      <style>{`
        .pv-scope {
          --ink: #14100E;
          --surface: #1E1917;
          --surface-alt: #2A2422;
          --bone: #F5F2ED;
          --muted: #A8A29A;
          --border: rgba(245, 242, 237, 0.08);
          --brass: #B8956A;
        }
        @keyframes pv-kenburns {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
        .pv-kenburns {
          animation: pv-kenburns 12s cubic-bezier(0.25, 0, 0.3, 1) infinite alternate;
        }
        .pv-fade-x {
          -webkit-mask-image: linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent);
          mask-image: linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent);
        }
      `}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--ink)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-8 px-4 sm:px-6 lg:px-10 h-16">
          {!searchOpen && (
            <Link to="/prime-video" className="flex items-baseline gap-1.5 flex-shrink-0">
              <span className="font-display italic font-bold text-2xl text-[var(--bone)]">Avenzo</span>
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brass)]">
                Studio
              </span>
            </Link>
          )}

          {!searchOpen && (
            <nav className="hidden md:flex items-center gap-6">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    'relative py-2 text-sm transition-avenzo ' +
                    (isActive
                      ? "text-[var(--bone)] after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:bg-[var(--brass)]"
                      : 'text-[var(--muted)] hover:text-[var(--bone)]')
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className={'flex items-center gap-3 ' + (searchOpen ? 'flex-1' : 'ml-auto')}>
            {searchOpen ? (
              <form onSubmit={submit} className="flex items-center gap-3 w-full animate-fade-in">
                <Search className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Avenzo Studio"
                  className="flex-1 bg-transparent text-[var(--bone)] placeholder-[var(--muted)] text-sm py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false)
                    setQuery('')
                  }}
                  className="p-2 text-[var(--muted)] hover:text-[var(--bone)] transition-avenzo flex-shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-white/5 text-[var(--muted)] hover:text-[var(--bone)] transition-avenzo"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
                <Link
                  to="/prime-video/my-stuff"
                  className="w-8 h-8 rounded-full bg-[var(--surface-alt)] border border-transparent hover:border-[var(--brass)] flex items-center justify-center text-xs font-semibold text-[var(--bone)] transition-avenzo"
                  aria-label="My Stuff"
                >
                  Z
                </Link>
              </>
            )}
          </div>
        </div>

        {!searchOpen && (
          <div className="md:hidden border-t border-[var(--border)] px-4 py-2 overflow-x-auto no-scrollbar pv-fade-x">
            <div className="flex gap-5 w-max">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    'text-sm whitespace-nowrap pb-2 pt-1.5 border-b-2 transition-avenzo ' +
                    (isActive ? 'border-[var(--brass)] text-[var(--bone)]' : 'border-transparent text-[var(--muted)]')
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <Outlet />
      </div>

      <div className="border-t border-[var(--border)] py-10 text-center">
        <p className="font-display italic text-lg text-[var(--bone)]/80 mb-1">Avenzo Studio</p>
        <p className="text-xs text-[var(--muted)]">A concept streaming experience. Not affiliated with Amazon Prime Video.</p>
      </div>
    </div>
  )
}
