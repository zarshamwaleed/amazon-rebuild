import { Link } from 'react-router-dom'
import Rating from './Rating'
import { formatPrice } from '../lib/utils'

export default function ProductCard({ product }) {
  if (!product) return null
  const hasDiscount = product.old_price && Number(product.old_price) > Number(product.price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : 0

  return (
    <Link
      to={'/products/' + product.id}
      className="group bg-white border border-gray-200 rounded-md p-3 flex flex-col hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square bg-gray-50 rounded mb-3 overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <span className="text-xs text-gray-400">No image</span>
        )}
      </div>

      <h3 className="text-sm text-gray-900 font-medium line-clamp-2 leading-snug group-hover:text-[#c7511f]">
        {product.title}
      </h3>

      <div className="mt-1">
        <Rating value={product.rating} count={product.review_count} />
      </div>

      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        <span className="text-lg font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
        {hasDiscount && (
          <>
            <span className="text-xs text-gray-500 line-through">
              ${Number(product.old_price).toFixed(2)}
            </span>
            <span className="text-xs text-red-600 font-medium">-{discountPct}%</span>
          </>
        )}
      </div>

      {product.brand && (
        <div className="mt-1 text-xs text-gray-500">{product.brand}</div>
      )}

      <div className="mt-2 text-xs text-gray-600">
        {product.stock > 0 ? 'In Stock' : <span className="text-red-600">Out of Stock</span>}
      </div>
    </Link>
  )
}
