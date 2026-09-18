import { useState } from 'react'
import { Gift, X, Mail, Printer, Package, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getGiftCardDesign } from '../services/giftCardService'

const AMOUNTS = [25, 50, 100, 150, 200]

const DELIVERY_OPTIONS = [
  { id: 'email', label: 'Email (instant)', icon: Mail },
  { id: 'print', label: 'Print at home', icon: Printer },
  { id: 'physical', label: 'Physical (shipped)', icon: Package, fee: 2.99 },
]

export default function AddGiftCardModal({ card, onClose, onAdd }) {
  const { user, profile } = useAuth()
  const { pushToast } = useToast()

  const [amount, setAmount] = useState(card.price || 50)
  const [customAmount, setCustomAmount] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState(
    card.delivery || 'email'
  )
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [senderName, setSenderName] = useState(profile?.full_name || '')
  const [message, setMessage] = useState('')
  const [scheduleNow, setScheduleNow] = useState(true)
  const [scheduledDate, setScheduledDate] = useState('')
  const [error, setError] = useState(null)

  const finalAmount = useCustom ? Number(customAmount) : amount

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!finalAmount || finalAmount < 5) return setError('Minimum gift card amount is $5')
    if (finalAmount > 500) return setError('Maximum gift card amount is $500')
    if (!recipientName.trim()) return setError('Recipient name is required')
    if (deliveryMethod === 'email' && !recipientEmail.trim())
      return setError('Recipient email is required for email delivery')
    if (!scheduleNow && !scheduledDate) return setError('Please choose a delivery date')

    onAdd({
      designId: card.id,
      name: card.name,
      amount: finalAmount,
      gradient: card.gradient,
      deliveryMethod,
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim() || null,
      senderName: senderName.trim() || null,
      message: message.trim() || null,
      scheduledDate: scheduleNow ? null : scheduledDate,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#c7511f]" />
            <h2 className="font-bold text-gray-900">Add Gift Card</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Card preview */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div
              className={
                'flex-1 rounded-lg bg-gradient-to-br ' +
                (card.gradient || 'from-[#232f3e] to-[#131921]') +
                ' aspect-[16/10] p-5 flex flex-col justify-between text-white shadow-md'
              }
            >
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-90">
                Amazon Rebuild
              </div>
              <div>
                <div className="text-4xl font-bold">${finalAmount || 0}</div>
                <div className="text-xs uppercase tracking-wider opacity-90 mt-1">
                  {card.name}
                </div>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Amount
            </label>
            <div className="flex flex-wrap gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setAmount(a)
                    setUseCustom(false)
                  }}
                  className={
                    'px-4 py-2 rounded border text-sm font-medium transition ' +
                    (!useCustom && amount === a
                      ? 'border-[#c7511f] bg-orange-50 text-[#c7511f]'
                      : 'border-gray-300 hover:border-gray-400')
                  }
                >
                  ${a}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={
                  'px-4 py-2 rounded border text-sm font-medium transition ' +
                  (useCustom
                    ? 'border-[#c7511f] bg-orange-50 text-[#c7511f]'
                    : 'border-gray-300 hover:border-gray-400')
                }
              >
                Custom
              </button>
            </div>
            {useCustom && (
              <div className="mt-3 flex items-center gap-2 max-w-xs">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter $5 – $500"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            )}
          </div>

          {/* Delivery method */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Delivery method
            </label>
            <div className="grid sm:grid-cols-3 gap-2">
              {DELIVERY_OPTIONS.map((d) => {
                const Icon = d.icon
                const active = deliveryMethod === d.id
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDeliveryMethod(d.id)}
                    className={
                      'text-left p-3 rounded border transition flex items-start gap-2 ' +
                      (active
                        ? 'border-[#c7511f] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-400')
                    }
                  >
                    <Icon className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {d.label}
                      </div>
                      {d.fee && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          +${d.fee.toFixed(2)} shipping
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recipient */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Recipient name">
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Sarah"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </Field>
            <Field label={`Recipient email${deliveryMethod !== 'email' ? ' (optional)' : ''}`}>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </Field>
          </div>

          <Field label="From">
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </Field>

          <Field label="Personal message (optional)">
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              placeholder="Happy Birthday! Hope you love it."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <div className="text-xs text-gray-400 mt-1 text-right">
              {message.length}/200
            </div>
          </Field>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" /> Deliver
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setScheduleNow(true)}
                className={
                  'flex-1 py-2 rounded border text-sm ' +
                  (scheduleNow
                    ? 'border-[#c7511f] bg-orange-50 font-medium'
                    : 'border-gray-300 hover:border-gray-400')
                }
              >
                Immediately
              </button>
              <button
                type="button"
                onClick={() => setScheduleNow(false)}
                className={
                  'flex-1 py-2 rounded border text-sm ' +
                  (!scheduleNow
                    ? 'border-[#c7511f] bg-orange-50 font-medium'
                    : 'border-gray-300 hover:border-gray-400')
                }
              >
                On a specific date
              </button>
            </div>
            {!scheduleNow && (
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            )}
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-6 py-2 rounded transition"
            >
              Add to Cart — ${finalAmount || 0}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}