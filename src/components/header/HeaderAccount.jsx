import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function HeaderAccount() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    null

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
    <div
      className="relative flex-shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to={user ? '/account' : '/login'}
        className="flex flex-col px-2 py-2 border border-transparent hover:border-white rounded transition"
      >
        <span className="text-xs text-gray-200 leading-tight">
          {user ? `Hello, ${firstName}` : 'Hello, sign in'}
        </span>
        <span className="text-sm font-bold flex items-center gap-0.5 leading-tight">
          Account & Lists
          <ChevronDown className="w-3 h-3 text-gray-300 mt-0.5" />
        </span>
      </Link>

      {open && (
        <div className="absolute right-0 top-full pt-1 w-60 z-50">
          <div className="bg-white text-gray-800 shadow-lg rounded border border-gray-200">
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
              <Link to="/coupons/my-coupons" className="block px-4 py-1.5 hover:bg-gray-100">
                Your Coupons
              </Link>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-1.5 hover:bg-gray-100 border-t mt-1 pt-2"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}