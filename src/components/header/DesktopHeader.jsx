import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import SearchBar from '../SearchBar'
import { useWishlist } from '../../context/WishlistContext'
import HeaderAccount from './HeaderAccount'
import CartButton from './CartButton'

export default function DesktopHeader() {
  const { count: wishlistCount } = useWishlist()

  return (
    <div className="max-w-[1500px] mx-auto flex items-center gap-6 px-4 sm:px-6 py-4">
      <Link to="/" className="flex-shrink-0 group">
        <span className="font-display text-2xl leading-none font-medium tracking-tight text-charcoal-900 group-hover:text-brass-700 transition-avenzo">
          Avenzo
        </span>
      </Link>

      <div className="flex-1 min-w-0 max-w-2xl">
        <SearchBar />
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
        <Link
          to="/wishlist"
          aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}`}
          className="group relative flex items-center justify-center p-2.5 rounded-full hover:bg-stone-100 transition-avenzo"
        >
          <Heart className="w-5 h-5 text-charcoal-800 transition-transform duration-fast group-hover:scale-110" />
          {wishlistCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-brass-500 text-bone-50 text-[9px] font-semibold flex items-center justify-center leading-none">
              {wishlistCount > 99 ? '99+' : wishlistCount}
            </span>
          )}
        </Link>

        <HeaderAccount />
        <CartButton />
      </div>
    </div>
  )
}
