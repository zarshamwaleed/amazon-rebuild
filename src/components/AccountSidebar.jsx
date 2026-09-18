import { NavLink } from 'react-router-dom'
import { User, Package, Heart, LogOut, Mail, RotateCcw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const links = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/orders', label: 'Your Orders', icon: Package },
  { to: '/wishlist', label: 'Your Wishlist', icon: Heart },
  { to: '/messages', label: 'Your Messages', icon: Mail },
  { to: '/returns', label: 'Your Returns', icon: RotateCcw },
]

export default function AccountSidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      <nav className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {links.map((l) => {
          const Icon = l.icon
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                'flex items-center gap-2 px-4 py-3 text-sm border-b last:border-b-0 hover:bg-gray-50 ' +
                (isActive ? 'font-bold text-[#c7511f] bg-gray-50' : 'text-gray-700')
              }
            >
              <Icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          )
        })}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-3 text-sm w-full text-left text-gray-700 hover:bg-gray-50 border-t"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </nav>
    </aside>
  )
}
