import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CartItem from '../components/CartItem'
import CartSummary from '../components/CartSummary'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'

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

  if (!ready) {
    return (
      <div className="py-20 text-center text-sm text-gray-600">Loading your cart…</div>
    )
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
        <EmptyState
          title="Your Amazon Rebuild Cart is empty"
          message="Browse products and add items to your cart."
        />
        <div className="text-center mt-6">
          <Link
            to="/products"
            className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2.5 rounded transition"
          >
            Continue shopping
          </Link>
        </div>
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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-md px-5">
            <div className="flex items-center justify-between py-4 border-b">
              <span className="text-sm text-gray-600">Price</span>
              <button
                onClick={clearCart}
                className="text-xs text-blue-600 hover:text-[#c7511f] hover:underline"
              >
                Clear cart
              </button>
            </div>
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
            <div className="text-right py-4 text-base">
              Subtotal ({count} item{count !== 1 ? 's' : ''}):{' '}
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-40">
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              count={count}
              onCheckout={handleCheckout}
            >
              {!user && (
                <p className="text-xs text-gray-600 text-center pt-2">
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

