import { Lock, ShieldCheck, Truck } from 'lucide-react'
import Button from './Button'
import { formatPrice } from '../lib/utils'

export default function CartSummary({
  subtotal,
  shipping,
  tax,
  total,
  count,
  appliedGiftCard = 0,
  children,
  showCheckout = true,
  onCheckout,
}) {
  const finalTotal = Math.max(0, total - appliedGiftCard)

  return (
    <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle overflow-hidden">
      <div className="p-5 space-y-4">
        <h2 className="heading-sub">Order Summary</h2>

        <div className="text-sm space-y-2.5">
          <div className="flex justify-between text-charcoal-600">
            <span>
              Items ({count})
            </span>
            <span className="text-charcoal-800">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-charcoal-600">
            <span>Shipping</span>
            <span className="text-charcoal-800">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-charcoal-600">
            <span>Estimated tax</span>
            <span className="text-charcoal-800">{formatPrice(tax)}</span>
          </div>

          {appliedGiftCard > 0 && (
            <div className="flex justify-between text-success-700 font-medium">
              <span>Gift card applied</span>
              <span>-{formatPrice(appliedGiftCard)}</span>
            </div>
          )}
        </div>

        {subtotal > 0 && subtotal < 50 && (
          <div className="flex items-start gap-2 text-caption bg-stone-50 border border-stone-200 rounded-lg p-2.5">
            <Truck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brass-600" />
            <span>
              Add {formatPrice(50 - subtotal)} more for free standard shipping.
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-4 border-t border-stone-200">
          <span className="text-sm font-semibold text-charcoal-900">Order total</span>
          <span className="text-price-lg">{formatPrice(finalTotal)}</span>
        </div>

        {showCheckout && (
          <Button variant="secondary" size="lg" onClick={onCheckout} className="w-full">
            Proceed to checkout
          </Button>
        )}

        {children}
      </div>

      <div className="bg-stone-50 border-t border-stone-200 px-5 py-3 flex items-center justify-center gap-4 text-caption">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Secure checkout
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Buyer protection
        </span>
      </div>
    </div>
  )
}
