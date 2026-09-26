import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import QuantitySelector from './QuantitySelector'
import Badge from './Badge'
import { useWishlist } from '../context/WishlistContext'
import { formatPrice } from '../lib/utils'

const REMOVE_DURATION = 220

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, quantity, giftCard } = item
  const [removing, setRemoving] = useState(false)

  function handleRemove() {
    setRemoving(true)
    setTimeout(() => onRemove(product.id), REMOVE_DURATION)
  }

  const wrapClass =
    'grid grid-cols-[auto,1fr,auto] gap-4 sm:gap-5 py-5 border-b border-stone-200 last:border-b-0 ' +
    'transition-all ease-avenzo-out overflow-hidden ' +
    (removing ? 'opacity-0 -translate-x-2 max-h-0 !py-0' : 'opacity-100 max-h-96')

  if (giftCard) {
    return (
      <div
        className={wrapClass}
        style={{ transitionDuration: REMOVE_DURATION + 'ms' }}
      >
        <div
          className={
            'w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 rounded-lg bg-gradient-to-br ' +
            (giftCard.gradient || 'from-charcoal-800 to-charcoal-900') +
            ' flex flex-col justify-between p-2.5 text-bone-50 shadow-subtle'
          }
        >
          <span className="text-[8px] uppercase tracking-wider font-bold opacity-90">Gift Card</span>
          <div className="text-lg font-bold">${giftCard.amount}</div>
        </div>

        <div className="min-w-0">
          <div className="text-sm sm:text-base font-medium text-charcoal-900 line-clamp-2">
            {giftCard.name}
          </div>
          <div className="text-caption mt-0.5 capitalize">{giftCard.deliveryMethod} delivery</div>

          <div className="text-caption mt-2.5 space-y-0.5">
            <div>
              <strong className="text-charcoal-700">To:</strong> {giftCard.recipientName}
              {giftCard.recipientEmail ? ` · ${giftCard.recipientEmail}` : ''}
            </div>
            {giftCard.senderName && (
              <div>
                <strong className="text-charcoal-700">From:</strong> {giftCard.senderName}
              </div>
            )}
            {giftCard.scheduledDate && (
              <div>
                <strong className="text-charcoal-700">Deliver:</strong>{' '}
                {new Date(giftCard.scheduledDate).toLocaleDateString()}
              </div>
            )}
            {giftCard.message && <div className="italic text-charcoal-500">"{giftCard.message}"</div>}
          </div>

          <button
            onClick={handleRemove}
            className="flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-error-700 transition-avenzo mt-3"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-price">{formatPrice(product.price)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapClass} style={{ transitionDuration: REMOVE_DURATION + 'ms' }}>
      <Link
        to={'/products/' + product.id}
        className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-stone-50 rounded-xl border border-stone-200 overflow-hidden"
      >
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        ) : null}
      </Link>

      <div className="min-w-0">
        <Link
          to={'/products/' + product.id}
          className="text-sm sm:text-base font-medium text-charcoal-900 hover:text-brass-700 transition-avenzo line-clamp-2"
        >
          {product.title}
        </Link>
        {product.brand && <p className="text-caption mt-0.5">{product.brand}</p>}
        <div className="mt-2">
          <Badge color="green" variant="dot">
            In Stock
          </Badge>
        </div>

        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <QuantitySelector
            value={quantity}
            onChange={(q) => onUpdateQuantity(product.id, q)}
            max={product.stock || 99}
          />
          <div className="flex items-center gap-3">
            <SaveForLaterButton product={product} onSaved={handleRemove} />
            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-error-700 transition-avenzo"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-price-lg">{formatPrice(Number(product.price) * quantity)}</div>
        {quantity > 1 && (
          <div className="text-caption mt-0.5">{formatPrice(product.price)} each</div>
        )}
      </div>
    </div>
  )
}

function SaveForLaterButton({ product, onSaved }) {
  const { isWishlisted, toggleWishlist } = useWishlist()

  if (isWishlisted(product.id)) return null

  function handleClick() {
    toggleWishlist(product)
    onSaved()
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-brass-700 transition-avenzo"
    >
      <Heart className="w-3.5 h-3.5" /> Save for later
    </button>
  )
}
