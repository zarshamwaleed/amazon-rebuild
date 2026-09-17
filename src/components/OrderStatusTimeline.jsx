import { CheckCircle, Circle } from 'lucide-react'

const STEPS = [
  { id: 'order_placed', label: 'Order Placed', description: 'We received your order' },
  { id: 'processing', label: 'Processing', description: 'Preparing your items' },
  { id: 'shipped', label: 'Shipped', description: 'On the way to you' },
  { id: 'out_for_delivery', label: 'Out for Delivery', description: 'With your local courier' },
  { id: 'delivered', label: 'Delivered', description: 'Package arrived' },
]

export default function OrderStatusTimeline({ status }) {
  const activeIndex = Math.max(0, STEPS.findIndex((s) => s.id === status))

  return (
    <ol className="relative">
      {STEPS.map((step, i) => {
        const done = i <= activeIndex
        const current = i === activeIndex
        return (
          <li key={step.id} className="flex gap-3 pb-6 last:pb-0 relative">
            {/* Vertical line */}
            {i < STEPS.length - 1 && (
              <span
                className={
                  'absolute left-[11px] top-6 bottom-0 w-0.5 ' +
                  (i < activeIndex ? 'bg-green-600' : 'bg-gray-300')
                }
              />
            )}
            {/* Icon */}
            <span className="relative z-10 flex-shrink-0">
              {done ? (
                <CheckCircle className={'w-6 h-6 ' + (current ? 'text-[#c7511f]' : 'text-green-600')} />
              ) : (
                <Circle className="w-6 h-6 text-gray-300" />
              )}
            </span>
            {/* Text */}
            <div className="pt-0.5">
              <div
                className={
                  'text-sm font-medium ' +
                  (current ? 'text-[#c7511f]' : done ? 'text-gray-900' : 'text-gray-500')
                }
              >
                {step.label}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
