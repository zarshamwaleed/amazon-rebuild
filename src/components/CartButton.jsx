import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

export default function CartButton({ count = 0 }) {
  return (
    <Link
      to="/cart"
      className="relative flex items-end px-2 py-2 cursor-pointer border border-transparent hover:border-white rounded transition"
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
  )
}
