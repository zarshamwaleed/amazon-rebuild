import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import Logo from './Logo'
import LocationSelector from './LocationSelector'
import SearchBar from './SearchBar'
import AccountMenu from './AccountMenu'
import CartButton from './CartButton'
import MobileNav from './MobileNav'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function Header() {
  const { count } = useCart()
  const { count: wishlistCount } = useWishlist()

  return (
    <header className="sticky top-0 z-40">
      {/* Thin top bar */}
      <div className="bg-[#131921] text-white text-xs">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between px-3 sm:px-4 py-1">
          <div className="hidden sm:flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Hello! Deliver to Pakistan</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link
              to="/wishlist"
              className="hover:underline hidden sm:inline-flex items-center gap-1"
            >
              <Heart className="w-3 h-3" />
              Wishlist
              {wishlistCount > 0 && (
                <span className="ml-1 bg-[#febd69] text-[#131921] rounded-full px-1.5 py-0 text-[10px] font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <span className="hover:underline cursor-pointer hidden md:inline">Customer Service</span>
            <span className="hover:underline cursor-pointer hidden md:inline">Registry</span>
            <span className="hover:underline cursor-pointer hidden md:inline">Gift Cards</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-[#131921] text-white">
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4">
          {/* Desktop single row (md and up) */}
          <div className="hidden md:flex items-center gap-2 py-2">
            <Logo />
            <LocationSelector />
            <div className="flex-1 min-w-0">
              <SearchBar />
            </div>
            <Link
              to="/orders"
              className="flex flex-col px-2 py-2 border border-transparent hover:border-white rounded transition"
            >
              <span className="text-xs text-gray-200">Returns</span>
              <span className="text-sm font-bold">& Orders</span>
            </Link>
            <AccountMenu />
            <CartButton count={count} />
          </div>

          {/* Mobile rows (below md) */}
          <div className="md:hidden py-2 space-y-2">
            <div className="flex items-center gap-2">
              <MobileNav />
              <Logo />
              <div className="ml-auto flex items-center gap-1">
                <CartButton count={count} />
              </div>
            </div>
            <div className="pb-1">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
