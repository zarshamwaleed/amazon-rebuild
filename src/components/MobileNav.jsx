import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  { name: 'Home', to: '/' },
  { name: 'All Products', to: '/products' },
  { name: 'Electronics', to: '/category/electronics' },
  { name: 'Books', to: '/category/books' },
  { name: 'Home & Kitchen', to: '/category/home-kitchen' },
  { name: 'Fashion', to: '/category/fashion' },
  { name: 'Sports & Outdoors', to: '/category/sports-outdoors' },
  { name: 'Toys & Games', to: '/category/toys-games' },
  { name: 'Your Orders', to: '/orders' },
  { name: 'Your Account', to: '/account' },
  { name: 'Your Wishlist', to: '/wishlist' },
  { name: 'Sign In', to: '/login' },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-1 px-2 py-1 border border-transparent hover:border-white rounded text-white"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white w-72 h-full shadow-xl flex flex-col">
            <div className="bg-[#232f3e] text-white flex items-center justify-between px-4 py-3">
              <span className="font-bold">Hello, sign in</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                >
                  {l.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
