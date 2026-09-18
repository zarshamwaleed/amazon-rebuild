import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift } from 'lucide-react'
import Button from '../components/Button'
import AddressForm from '../components/AddressForm'
import PaymentSelector from '../components/PaymentSelector'
import CartSummary from '../components/CartSummary'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getUserAddresses, createAddress } from '../services/addressService'
import { createOrder } from '../services/orderService'
import {
  issueGiftCardsForOrder,
  getUserGiftCardBalance,
  applyGiftCardBalanceToOrder,
} from '../services/giftCardService'
import { supabase } from '../services/supabase'

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', description: '3-5 business days', fee: 0 },
  { id: 'express', label: 'Express Delivery', description: '1-2 business days', fee: 7.99 },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, subtotal, shipping, tax, count, clearCart, ready } = useCart()

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const [delivery, setDelivery] = useState('standard')
  const [payment, setPayment] = useState('mock_card')

  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const [giftCardBalance, setGiftCardBalance] = useState(0)
  const [applyBalance, setApplyBalance] = useState(true)

  // If all cart items belong to the same registry, we tag the order
  const registryId = useMemo(() => {
    const ids = items
      .map((i) => i.registryId)
      .filter(Boolean)
    if (ids.length === 0) return null
    // If they're all the same, return it. Otherwise pick the first.
    const unique = [...new Set(ids)]
    return unique.length === 1 ? unique[0] : unique[0]
  }, [items])

  // Redirect to /cart if empty — BUT ONLY if we have not just placed an order
  useEffect(() => {
    if (orderPlaced) return
    if (ready && items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [ready, items.length, navigate, orderPlaced])

  // Load addresses
  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      try {
        setLoadingAddresses(true)
        const data = await getUserAddresses(user.id)
        if (cancelled) return
        setAddresses(data)
        if (data.length) setSelectedAddressId(data[0].id)
        else setShowAddressForm(true)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoadingAddresses(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  // Load gift card balance
  useEffect(() => {
    if (!user) return
    getUserGiftCardBalance(user.id)
      .then((b) => {
        setGiftCardBalance(b)
        setApplyBalance(b > 0) // auto-enable if user has balance
      })
      .catch(() => {})
  }, [user])

  async function handleAddAddress(data) {
    const created = await createAddress(user.id, data)
    setAddresses((prev) => [created, ...prev])
    setSelectedAddressId(created.id)
    setShowAddressForm(false)
  }

  const deliveryFee = delivery === 'express' ? 7.99 : subtotal >= 50 ? 0 : shipping || 0
  const finalTotal = +(subtotal + deliveryFee + tax).toFixed(2)

  const appliedGiftCard = applyBalance
    ? Math.min(giftCardBalance, finalTotal)
    : 0
  const amountDue = Math.max(0, finalTotal - appliedGiftCard)

  async function handlePlaceOrder() {
    setError(null)
    if (!selectedAddressId) return setError('Please select a shipping address')
    if (items.length === 0) return setError('Your cart is empty')

    setPlacing(true)
    try {
      const order = await createOrder({
        userId: user.id,
        addressId: selectedAddressId,
        items,
        subtotal,
        shippingFee: deliveryFee,
        tax,
        total: finalTotal,
        paymentMethod: payment,
        registryId,
      })

      // Issue gift cards (if any) — fetch the created order_items so we can link them
      if (items.some((i) => i.giftCard)) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)
        await issueGiftCardsForOrder(user.id, order.id, orderItems || [], items)
      }

      // Apply gift card balance to order (deduct from user's balance)
      if (appliedGiftCard > 0) {
        try {
          await applyGiftCardBalanceToOrder(user.id, appliedGiftCard)
        } catch (err) {
          console.warn('Failed to deduct balance:', err)
          // Non-fatal — the order is placed; log for admin
        }
      }

      // Mark as placed BEFORE clearing so the guard effect does not fire
      setOrderPlaced(true)

      await clearCart()

      navigate('/order-confirmation/' + order.id, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not place order')
      setPlacing(false)
    }
  }

  if (!ready || loadingAddresses) {
    return <div className="py-20 text-center text-sm text-gray-600">Preparing checkout…</div>
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Add items to your cart before checking out."
      />
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-gray-200 rounded-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Shipping address</h2>

            {showAddressForm ? (
              <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddressForm(false)} />
            ) : (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={
                      'flex items-start gap-3 p-3 rounded border cursor-pointer ' +
                      (selectedAddressId === a.id
                        ? 'border-[#c7511f] bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400')
                    }
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{a.full_name}</div>
                      <div className="text-gray-700">{a.address_line}</div>
                      <div className="text-gray-700">
                        {a.city}
                        {a.postal_code ? ', ' + a.postal_code : ''}
                      </div>
                      <div className="text-gray-700">{a.country}</div>
                      {a.phone && <div className="text-gray-500 text-xs mt-1">{a.phone}</div>}
                    </div>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="text-sm text-blue-600 hover:text-[#c7511f] hover:underline"
                >
                  + Add new address
                </button>
              </div>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Delivery method</h2>
            <div className="space-y-2">
              {DELIVERY_OPTIONS.map((d) => {
                // Standard is only free when subtotal ≥ 50
                const realFee =
                  d.id === 'standard' ? (subtotal >= 50 ? 0 : 5.99) : d.fee
                return (
                  <label
                    key={d.id}
                    className={
                      'flex items-center justify-between gap-3 p-3 rounded border cursor-pointer ' +
                      (delivery === d.id
                        ? 'border-[#c7511f] bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400')
                    }
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={delivery === d.id}
                        onChange={() => setDelivery(d.id)}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{d.label}</div>
                        <div className="text-xs text-gray-600">{d.description}</div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {realFee === 0 ? 'FREE' : '$' + realFee.toFixed(2)}
                    </span>
                  </label>
                )
              })}
            </div>
            {subtotal < 50 && (
              <p className="text-xs text-gray-500 mt-3">
                Add ${(50 - subtotal).toFixed(2)} more to qualify for free Standard Delivery.
              </p>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Payment method</h2>
            <PaymentSelector value={payment} onChange={setPayment} />
            <p className="text-xs text-gray-500 mt-3">
              This is a mock payment system — no real money is charged.
            </p>
          </section>

          <section className="bg-white border border-gray-200 rounded-md p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Review items</h2>
            {registryId && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-900 flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4" />
                This order includes items from a registry. The registry owner will be
                notified of your purchase.
              </div>
            )}
            <ul className="text-sm divide-y">
              {items.map((i) => (
                <li key={i.product.id} className="py-2 flex justify-between gap-3">
                  <span className="line-clamp-1 text-gray-700">
                    {i.product.title} × {i.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    ${(Number(i.product.price) * i.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-40 space-y-3">
            <CartSummary
              subtotal={subtotal}
              shipping={deliveryFee}
              tax={tax}
              total={finalTotal}
              count={count}
              giftCardBalance={giftCardBalance}
              appliedGiftCard={appliedGiftCard}
              showCheckout={false}
            />

            {giftCardBalance > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyBalance}
                    onChange={(e) => setApplyBalance(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-green-900">
                      Apply gift card balance (${giftCardBalance.toFixed(2)} available)
                    </div>
                    {applyBalance && appliedGiftCard > 0 && (
                      <div className="text-xs text-green-800 mt-1">
                        -${appliedGiftCard.toFixed(2)} will be applied to this order
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full"
            >
              {placing ? 'Placing order…' : `Place your order · $${amountDue.toFixed(2)}`}
            </Button>
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}