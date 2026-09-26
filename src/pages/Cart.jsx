import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CartItem from '../components/CartItem'
import CartSummary from '../components/CartSummary'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import { getUserGiftCardBalance } from '../services/giftCardService'
import { formatPrice } from '../lib/utils'

export default function Cart() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    items,
    count,
    subtotal,
    shipping,
    tax,
    total,
    updateQuantity,
    removeItem,
    clearCart,
    ready,
  } = useCart()

  const [giftCardBalance, setGiftCardBalance] = useState(0)

  useEffect(() => {
    if (!user) return
    getUserGiftCardBalance(user.id).then(setGiftCardBalance).catch(() => {})
  }, [user])

  if (!ready) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-5 bg-bone-50 border border-stone-200 rounded-xl p-5">
            <div className="skeleton-shimmer w-28 h-28 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-3 py-1">
              <div className="skeleton-shimmer h-4 rounded w-2/3" />
              <div className="skeleton-shimmer h-3 rounded w-1/3" />
              <div className="skeleton-shimmer h-8 rounded w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Browse our collections and add something you'll love."
          action={
            <Button variant="secondary" size="lg" onClick={() => navigate('/products')}>
              Continue shopping
            </Button>
          }
        />
      </div>
    )
  }

  function handleCheckout() {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="heading-page">Shopping Cart</h1>
          <p className="text-body-sm mt-1">
            {count} item{count !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-av-label uppercase tracking-wide text-charcoal-500 hover:text-error-700 transition-avenzo"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle px-5">
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <Link
            to="/products"
            className="inline-block mt-5 text-sm font-medium text-brass-700 hover:text-brass-800 transition-avenzo"
          >
            ← Continue shopping
          </Link>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-40 space-y-3">
            {giftCardBalance > 0 && (
              <div className="text-sm text-success-700 bg-success-50 border border-success-500/20 rounded-xl p-3.5">
                You have <strong>{formatPrice(giftCardBalance)}</strong> in gift card balance. It
                will be applied at checkout.
              </div>
            )}
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              count={count}
              giftCardBalance={giftCardBalance}
              appliedGiftCard={0}
              onCheckout={handleCheckout}
            >
              {!user && (
                <p className="text-caption text-center pt-1">
                  You'll be asked to sign in to complete checkout.
                </p>
              )}
            </CartSummary>
          </div>
        </div>
      </div>
    </div>
  )
}
