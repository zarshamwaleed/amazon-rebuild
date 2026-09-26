import { Banknote, CreditCard, Wallet } from 'lucide-react'

export const PAYMENT_OPTIONS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives.',
    icon: Banknote,
  },
  {
    id: 'mock_card',
    label: 'Credit / Debit Card',
    description: 'Simulated card payment — no real charge.',
    icon: CreditCard,
  },
  {
    id: 'mock_wallet',
    label: 'Test Wallet',
    description: 'Use a mock wallet balance for instant payment.',
    icon: Wallet,
  },
]

export default function PaymentSelector({ value, onChange }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {PAYMENT_OPTIONS.map((o) => {
        const selected = value === o.id
        const Icon = o.icon
        return (
          <label
            key={o.id}
            className={
              'relative flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-avenzo ' +
              'focus-within:shadow-focus-ring ' +
              (o.disabled
                ? 'opacity-50 cursor-not-allowed border-stone-200 bg-stone-50'
                : selected
                ? 'border-brass-400 bg-brass-50 shadow-soft'
                : 'border-stone-200 bg-bone-50 hover:border-stone-400 hover:shadow-subtle')
            }
          >
            <input
              type="radio"
              name="payment"
              value={o.id}
              checked={selected}
              onChange={() => !o.disabled && onChange(o.id)}
              disabled={o.disabled}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <span
                className={
                  'flex items-center justify-center w-10 h-10 rounded-lg transition-avenzo ' +
                  (selected ? 'bg-brass-400 text-charcoal-900' : 'bg-stone-100 text-charcoal-500')
                }
              >
                <Icon className="w-5 h-5" />
              </span>
              <span
                className={
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-avenzo ' +
                  (selected ? 'border-brass-500' : 'border-stone-300')
                }
              >
                {selected && <span className="w-2 h-2 rounded-full bg-brass-500 animate-scale-in" />}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-charcoal-900">{o.label}</div>
              <div className="text-caption mt-0.5">{o.description}</div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
