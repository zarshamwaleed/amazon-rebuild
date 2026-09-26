import { Check } from 'lucide-react'

const STEPS = [
  { id: 'order_placed', label: 'Order Placed', description: 'We received your order' },
  { id: 'processing', label: 'Processing', description: 'Preparing your items' },
  { id: 'shipped', label: 'Shipped', description: 'On the way to you' },
  { id: 'out_for_delivery', label: 'Out for Delivery', description: 'With your local courier' },
  { id: 'delivered', label: 'Delivered', description: 'Package arrived' },
]

export default function OrderStatusTimeline({ status }) {
  const cancelled = status === 'cancelled'
  const activeIndex = Math.max(0, STEPS.findIndex((s) => s.id === status))

  return (
    <ol className="relative">
      {STEPS.map((step, i) => {
        const done = !cancelled && i <= activeIndex
        const current = !cancelled && i === activeIndex
        return (
          <li key={step.id} className="flex gap-3.5 pb-7 last:pb-0 relative">
            {i < STEPS.length - 1 && (
              <span
                className={
                  'absolute left-[13px] top-7 bottom-0 w-px ' +
                  (i < activeIndex && !cancelled ? 'bg-brass-400' : 'bg-stone-200')
                }
              />
            )}
            <span
              className={
                'relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-avenzo ' +
                (done
                  ? current
                    ? 'bg-brass-400 border-brass-400 text-charcoal-900'
                    : 'bg-charcoal-900 border-charcoal-900 text-bone-50'
                  : 'bg-bone-50 border-stone-300 text-stone-300')
              }
            >
              {done ? (
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </span>
            <div className="pt-0.5">
              <div
                className={
                  'text-sm font-medium ' +
                  (current ? 'text-charcoal-900' : done ? 'text-charcoal-800' : 'text-charcoal-400')
                }
              >
                {step.label}
              </div>
              <div className="text-caption">{step.description}</div>
            </div>
          </li>
        )
      })}
      {cancelled && (
        <li className="flex gap-3.5 relative pt-1">
          <span className="relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-error-50 border-2 border-error-500 text-error-700">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </span>
          <div className="pt-0.5">
            <div className="text-sm font-medium text-error-700">Cancelled</div>
            <div className="text-caption">This order was cancelled</div>
          </div>
        </li>
      )}
    </ol>
  )
}
