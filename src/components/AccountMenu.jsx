import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AccountMenu() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('[signOut]', err)
    }
  }

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there'

  return (
    <div className="relative group hidden md:block">
      <div className="px-2 py-2 cursor-pointer border border-transparent hover:border-white rounded transition">
        <div className="text-white leading-tight">
          <div className="text-xs text-gray-200">
            {user ? 'Hello, ' + firstName : 'Hello, sign in'}
          </div>
          <div className="text-sm font-bold flex items-center gap-0.5">
            Account & Lists
            <ChevronDown className="w-3 h-3 text-gray-300 mt-0.5" />
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-full mt-1 w-56 bg-white text-gray-800 shadow-lg rounded border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {!user ? (
          <div className="p-4 border-b text-center">
            <Link
              to="/login"
              className="block w-full bg-[#febd69] hover:bg-[#f3a847] text-gray-900 text-sm font-medium py-1.5 rounded transition"
            >
              Sign in
            </Link>
            <p className="text-xs text-gray-600 mt-2">
              New customer?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Start here.
              </Link>
            </p>
          </div>
        ) : (
          <div className="p-4 border-b text-center">
            <p className="text-sm text-gray-700">
              Signed in as <strong>{firstName}</strong>
            </p>
          </div>
        )}

        <div className="py-2 text-sm">
          <Link to="/account" className="block px-4 py-1.5 hover:bg-gray-100">
            Your Account
          </Link>
          <Link to="/orders" className="block px-4 py-1.5 hover:bg-gray-100">
            Your Orders
          </Link>
          <Link to="/wishlist" className="block px-4 py-1.5 hover:bg-gray-100">
            Your Wishlist
          </Link>
          {user && (
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-1.5 hover:bg-gray-100 border-t mt-1 pt-1.5"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
