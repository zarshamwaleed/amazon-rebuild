import { Link } from 'react-router-dom'
import { ShoppingCart, MapPin, ChevronDown } from 'lucide-react'
import SearchBar from '../SearchBar'
import { useCart } from '../../context/CartContext'
import HeaderAccount from './HeaderAccount'

export default function HeaderSearch() {
  const { count } = useCart()

  return (
    <div className="bg-[#131921] text-white">
      <div className="max-w-[1500px] mx-auto flex items-center gap-2 px-2 py-2">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center px-2 py-2 border border-transparent hover:border-white rounded transition flex-shrink-0"
        >
          <span className="text-white text-2xl font-bold tracking-tight">amazon</span>
          <span className="text-[#ff9900] text-2xl font-bold tracking-tight -ml-0.5">.rebuild</span>
        </Link>

        {/* Deliver to */}
        <div className="hidden md:flex items-end gap-1 px-2 py-2 cursor-pointer border border-transparent hover:border-white rounded transition flex-shrink-0">
          <MapPin className="w-4 h-4 text-white mb-1" />
          <div className="leading-tight">
            <div className="text-xs text-gray-300">Deliver to</div>
            <div className="text-sm font-bold">Pakistan</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-0">
          <SearchBar />
        </div>

        {/* Returns & Orders */}
        <Link
          to="/orders"
          className="hidden md:flex flex-col px-2 py-2 border border-transparent hover:border-white rounded transition flex-shrink-0"
        >
          <span className="text-xs text-gray-200">Returns</span>
          <span className="text-sm font-bold">& Orders</span>
        </Link>

        {/* Account */}
        {/* Account (dropdown) */}
<HeaderAccount />

        {/* Cart */}
        <Link
          to="/cart"
          className="relative flex items-end px-2 py-2 cursor-pointer border border-transparent hover:border-white rounded transition flex-shrink-0"
          aria-label={`Cart with ${count} items`}
        >
          <div className="relative">
            <ShoppingCart className="w-7 h-7 text-white" />
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[#febd69] font-bold text-sm">
              {count}
            </span>
          </div>
          <span className="text-white text-sm font-bold ml-1 hidden sm:inline">Cart</span>
        </Link>
      </div>
    </div>
  )
}
