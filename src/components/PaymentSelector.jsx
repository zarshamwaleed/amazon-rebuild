const OPTIONS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives.',
  },
  {
    id: 'mock_card',
    label: 'Credit / Debit Card (mock)',
    description: 'Simulated card payment — no real charge.',
  },
  {
    id: 'mock_wallet',
    label: 'Test Wallet',
    description: 'Use a mock wallet balance for instant payment.',
  },
]

export default function PaymentSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      {OPTIONS.map((o) => (
        <label
          key={o.id}
          className={
            'flex items-start gap-3 p-3 rounded border cursor-pointer transition ' +
            (value === o.id
              ? 'border-[#c7511f] bg-orange-50'
              : 'border-gray-300 hover:border-gray-400 bg-white')
          }
        >
          <input
            type="radio"
            name="payment"
            value={o.id}
            checked={value === o.id}
            onChange={() => onChange(o.id)}
            className="mt-1"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{o.label}</div>
            <div className="text-xs text-gray-600">{o.description}</div>
          </div>
        </label>
      ))}
    </div>
  )
}
