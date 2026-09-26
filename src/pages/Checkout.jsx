import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Gift, Loader2, MapPin, Package, Truck } from 'lucide-react'
import Button from '../components/Button'
import AddressForm from '../components/AddressForm'
import PaymentSelector, { PAYMENT_OPTIONS } from '../components/PaymentSelector'
import CartSummary from '../components/CartSummary'
import CheckoutSteps from '../components/CheckoutSteps'
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
import { formatPrice } from '../lib/utils'

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', description: '3-5 business days', fee: 0 },
  { id: 'express', label: 'Express Delivery', description: '1-2 business days', fee: 7.99 },
]

const STEPS = [
  { id: 'address', label: 'Shipping', icon: MapPin },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Package },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, subtotal, shipping, tax, count, clearCart, ready } = useCart()

  const [step, setStep] = useState(1)

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
    const ids = items.map((i) => i.registryId).filter(Boolean)
    if (ids.length === 0) return null
    const unique = [...new Set(ids)]
    return unique.length === 1 ? unique[0] : null
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
        setApplyBalance(b > 0)
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

  const appliedGiftCard = applyBalance ? Math.min(giftCardBalance, finalTotal) : 0
  const amountDue = Math.max(0, finalTotal - appliedGiftCard)

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)
  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.id === delivery)

  function goToStep(n) {
    setError(null)
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleContinue() {
    if (step === 1) {
      if (!selectedAddressId) return setError('Please select or add a shipping address')
    }
    setError(null)
    goToStep(Math.min(STEPS.length, step + 1))
  }

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

      if (items.some((i) => i.giftCard)) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)
        await issueGiftCardsForOrder(user.id, order.id, orderItems || [], items)
      }

      if (appliedGiftCard > 0) {
        try {
          await applyGiftCardBalanceToOrder(user.id, appliedGiftCard)
        } catch (err) {
          console.warn('Failed to deduct balance:', err)
        }
      }

      setOrderPlaced(true)
      await clearCart()
      navigate('/order-confirmation/' + order.id, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not place order')
      setPlacing(false)
    }
  }

  if (!ready || loadingAddresses) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-charcoal-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-body-sm">Preparing checkout…</span>
      </div>
    )
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Add items to your cart before checking out."
        action={
          <Button variant="secondary" size="lg" onClick={() => navigate('/products')}>
            Continue shopping
          </Button>
        }
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <h1 className="heading-page mb-6">Checkout</h1>

      <div className="mb-8 max-w-2xl">
        <CheckoutSteps steps={STEPS} currentStep={step} onStepClick={goToStep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div key={step} className="bg-bone-50 border border-stone-200 rounded-xl p-5 sm:p-6 shadow-subtle animate-fade-in-up">
            {step === 1 && (
              <>
                <h2 className="heading-sub mb-4">Shipping address</h2>
                {showAddressForm ? (
                  <AddressForm onSubmit={handleAddAddress} onCancel={addresses.length ? () => setShowAddressForm(false) : undefined} />
                ) : (
                  <div className="space-y-2.5">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={
                          'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-avenzo ' +
                          (selectedAddressId === a.id
                            ? 'border-brass-400 bg-brass-50'
                            : 'border-stone-200 hover:border-stone-400')
                        }
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="mt-1 accent-brass-500"
                        />
                        <div className="text-sm">
                          <div className="font-medium text-charcoal-900">{a.full_name}</div>
                          <div className="text-charcoal-600">{a.address_line}</div>
                          <div className="text-charcoal-600">
                            {a.city}
                            {a.postal_code ? ', ' + a.postal_code : ''}
                          </div>
                          <div className="text-charcoal-600">{a.country}</div>
                          {a.phone && <div className="text-caption mt-1">{a.phone}</div>}
                        </div>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="text-sm font-medium text-brass-700 hover:text-brass-800 transition-avenzo"
                    >
                      + Add new address
                    </button>
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="heading-sub mb-4">Delivery method</h2>
                <div className="space-y-2.5">
                  {DELIVERY_OPTIONS.map((d) => {
                    const realFee = d.id === 'standard' ? (subtotal >= 50 ? 0 : 5.99) : d.fee
                    return (
                      <label
                        key={d.id}
                        className={
                          'flex items-center justify-between gap-3 p-4 rounded-xl border cursor-pointer transition-avenzo ' +
                          (delivery === d.id
                            ? 'border-brass-400 bg-brass-50'
                            : 'border-stone-200 hover:border-stone-400')
                        }
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="delivery"
                            checked={delivery === d.id}
                            onChange={() => setDelivery(d.id)}
                            className="accent-brass-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-charcoal-900">{d.label}</div>
                            <div className="text-caption">{d.description}</div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-charcoal-900">
                          {realFee === 0 ? 'FREE' : formatPrice(realFee)}
                        </span>
                      </label>
                    )
                  })}
                </div>
                {subtotal < 50 && (
                  <p className="text-caption mt-3">
                    Add {formatPrice(50 - subtotal)} more to qualify for free Standard Delivery.
                  </p>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="heading-sub mb-4">Payment method</h2>
                <PaymentSelector value={payment} onChange={setPayment} />
                <p className="text-caption mt-4">
                  This is a mock payment system — no real money is charged.
                </p>
              </>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="heading-sub mb-4">Review your order</h2>
                  {registryId && (
                    <div className="bg-brass-50 border border-brass-200 rounded-xl p-3.5 text-sm text-brass-800 flex items-center gap-2 mb-4">
                      <Gift className="w-4 h-4 flex-shrink-0" />
                      This order includes items from a registry. The registry owner will be notified
                      of your purchase.
                    </div>
                  )}
                </div>

                <ReviewRow label="Shipping to" onEdit={() => goToStep(1)}>
                  {selectedAddress ? (
                    <>
                      <div className="font-medium text-charcoal-900">{selectedAddress.full_name}</div>
                      <div>
                        {selectedAddress.address_line}, {selectedAddress.city}
                        {selectedAddress.postal_code ? ', ' + selectedAddress.postal_code : ''}
                      </div>
                      <div>{selectedAddress.country}</div>
                    </>
                  ) : (
                    <span className="text-error-700">No address selected</span>
                  )}
                </ReviewRow>

                <ReviewRow label="Delivery" onEdit={() => goToStep(2)}>
                  <div className="font-medium text-charcoal-900">{selectedDelivery?.label}</div>
                  <div>{selectedDelivery?.description}</div>
                </ReviewRow>

                <ReviewRow label="Payment" onEdit={() => goToStep(3)}>
                  <div className="font-medium text-charcoal-900">
                    {PAYMENT_OPTIONS.find((o) => o.id === payment)?.label || payment.replace(/_/g, ' ')}
                  </div>
                </ReviewRow>

                <div className="border-t border-stone-200 pt-5">
                  <div className="text-label mb-3">Items ({count})</div>
                  <ul className="text-sm divide-y divide-stone-200">
                    {items.map((i) => (
                      <li key={i.product.id} className="py-2.5 flex justify-between gap-3">
                        <span className="line-clamp-1 text-charcoal-700">
                          {i.product.title} × {i.quantity}
                        </span>
                        <span className="font-medium text-charcoal-900">
                          {formatPrice(Number(i.product.price) * i.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-error-700 bg-error-50 border border-error-500/20 rounded-lg p-3 mt-4 animate-fade-in">
                {error}
              </div>
            )}

            {!showAddressForm && (
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-stone-200">
                {step > 1 ? (
                  <Button variant="ghost" onClick={() => goToStep(step - 1)}>
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                {step < 4 ? (
                  <Button variant="secondary" onClick={handleContinue}>
                    Continue
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={handlePlaceOrder} loading={placing}>
                    {placing ? 'Placing order…' : `Place your order · ${formatPrice(amountDue)}`}
                  </Button>
                )}
              </div>
            )}
          </div>
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
              <div className="bg-success-50 border border-success-500/20 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyBalance}
                    onChange={(e) => setApplyBalance(e.target.checked)}
                    className="mt-1 accent-brass-500"
                  />
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-success-700">
                      Apply gift card balance ({formatPrice(giftCardBalance)} available)
                    </div>
                    {applyBalance && appliedGiftCard > 0 && (
                      <div className="text-caption mt-1">
                        -{formatPrice(appliedGiftCard)} will be applied to this order
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewRow({ label, onEdit, children }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm text-charcoal-600">
      <div>
        <div className="text-label mb-1">{label}</div>
        {children}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-av-label uppercase tracking-wide text-brass-700 hover:text-brass-800 transition-avenzo flex-shrink-0"
      >
        Edit
      </button>
    </div>
  )
}
