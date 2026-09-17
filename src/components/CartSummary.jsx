import Button from './Button'
import { formatPrice } from '../lib/utils'

export default function CartSummary({ subtotal, shipping, tax, total, count, children, showCheckout = true, onCheckout }) {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-5 space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

      <div className="text-sm space-y-2 pt-2 border-t">
        <div className="flex justify-between text-gray-700">
          <span>Items ({count})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Estimated tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between items-baseline pt-3 border-t">
        <span className="text-base font-bold text-gray-900">Order total</span>
        <span className="text-xl font-bold text-[#b12704]">${total.toFixed(2)}</span>
      </div>

      {showCheckout && (
        <Button
          variant="secondary"
          onClick={onCheckout}
          className="w-full"
        >
          Proceed to checkout
        </Button>
      )}

      {children}
    </div>
  )
}
