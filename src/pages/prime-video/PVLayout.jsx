import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Search, Grid3x3 } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { label: 'Home', to: '/prime-video', end: true },
  { label: 'Movies', to: '/prime-video/movies' },
  { label: 'TV shows', to: '/prime-video/tv' },
  { label: 'Sports', to: '/prime-video/sports' },
]

export default function PVLayout() {
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!query.trim()) return
    navigate('/prime-video/search?q=' + encodeURIComponent(query.trim()))
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <div className="bg-[#0F171E] text-white -mx-3 sm:-mx-6 -my-6">
      {/* PV sub-nav */}
      <div className="border-b border-white/5">
        <div className="flex items-center gap-6 px-3 sm:px-4 py-3">
          <Link to="/prime-video" className="flex items-center flex-shrink-0">
            <span className="text-[#00A8E1] text-xl font-bold">prime</span>
            <span className="text-white text-xl font-bold -ml-1">video</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  'px-3 py-1.5 text-sm font-medium rounded transition ' +
                  (isActive ? 'text-white' : 'text-gray-300 hover:text-white')
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={submit} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search Prime Video"
                  className="bg-white/10 border border-white/20 rounded text-sm px-3 py-1.5 w-40 sm:w-56 focus:outline-none focus:border-[#00A8E1] placeholder-gray-400"
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded hover:bg-white/10"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-200" />
              </button>
            )}
            <button
              className="p-2 rounded hover:bg-white/10 hidden sm:block"
              aria-label="Apps"
            >
              <Grid3x3 className="w-5 h-5 text-gray-200" />
            </button>
            <Link
              to="/prime-video/my-stuff"
              className="p-1 rounded-full hover:ring-2 hover:ring-white/30"
              aria-label="My Stuff"
            >
              <div className="w-7 h-7 rounded-full bg-[#00A8E1] text-white flex items-center justify-center text-xs font-bold">
                Z
              </div>
            </Link>
          </div>
        </div>

        <div className="md:hidden border-t border-white/5 px-3 sm:px-4 py-2 overflow-x-auto no-scrollbar flex gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                'px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap ' +
                (isActive ? 'text-white bg-white/10' : 'text-gray-300')
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Content — matches Amazon main padding */}
      <div className="px-3 sm:px-4 py-6">
        <Outlet />
      </div>

      <div className="border-t border-white/5 py-8 text-center text-xs text-gray-500">
        Prime Video Rebuild — fictional streaming demo. Not affiliated with Amazon.
      </div>
    </div>
  )
}