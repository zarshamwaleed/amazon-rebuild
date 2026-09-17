import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import QuantitySelector from './QuantitySelector'

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, quantity } = item
  const lineTotal = Number(product.price) * quantity

  return (
    <div className="flex gap-4 py-5 border-b last:border-b-0">
      <Link
        to={'/products/' + product.id}
        className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded border border-gray-200 overflow-hidden"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : null}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={'/products/' + product.id}
          className="text-sm md:text-base font-medium text-gray-900 hover:text-[#c7511f] line-clamp-2"
        >
          {product.title}
        </Link>
        {product.brand && <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>}
        <p className="text-xs text-green-700 mt-1">In Stock</p>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <QuantitySelector
            value={quantity}
            onChange={(q) => onUpdateQuantity(product.id, q)}
            max={product.stock || 99}
          />
          <button
            onClick={() => onRemove(product.id)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-[#c7511f] hover:underline"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-base md:text-lg font-bold text-gray-900">
          ${lineTotal.toFixed(2)}
        </div>
        {quantity > 1 && (
          <div className="text-xs text-gray-500 mt-0.5">
            ${Number(product.price).toFixed(2)} each
          </div>
        )}
      </div>
    </div>
  )
}
