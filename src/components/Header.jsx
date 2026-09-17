import { Link } from 'react-router-dom'
import Logo from './Logo'
import LocationSelector from './LocationSelector'
import SearchBar from './SearchBar'
import AccountMenu from './AccountMenu'
import CartButton from './CartButton'
import MobileNav from './MobileNav'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[#131921] text-white text-xs">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between px-4 py-1">
          <div className="hidden sm:flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Hello! Deliver to Pakistan</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <span className="hover:underline cursor-pointer hidden md:inline">Customer Service</span>
            <span className="hover:underline cursor-pointer hidden md:inline">Registry</span>
            <span className="hover:underline cursor-pointer hidden md:inline">Gift Cards</span>
          </div>
        </div>
      </div>

      <div className="bg-[#131921] text-white">
        <div className="max-w-[1500px] mx-auto flex items-center gap-2 px-2 py-2">
          <MobileNav />
          <Logo />
          <LocationSelector />
          <div className="flex-1 min-w-0">
            <SearchBar />
          </div>

          <Link
            to="/orders"
            className="hidden md:flex flex-col px-2 py-2 border border-transparent hover:border-white rounded transition"
          >
            <span className="text-xs text-gray-200">Returns</span>
            <span className="text-sm font-bold">& Orders</span>
          </Link>

          <AccountMenu />
          <CartButton count={count} />
        </div>
      </div>
    </header>
  )
}
