import { useState } from 'react'
import { Gift, X, Mail, Printer, Package, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import Input from './Input'

const AMOUNTS = [25, 50, 100, 150, 200]

const DELIVERY_OPTIONS = [
  { id: 'email', label: 'Email (instant)', icon: Mail },
  { id: 'print', label: 'Print at home', icon: Printer },
  { id: 'physical', label: 'Physical (shipped)', icon: Package, fee: 2.99 },
]

export default function AddGiftCardModal({ card, onClose, onAdd }) {
  const { profile } = useAuth()

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
      <div className="absolute inset-0 bg-charcoal-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-bone-50 border-b border-stone-200 px-5 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-brass-600" />
            <h2 className="heading-sub">Add Gift Card</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Card preview */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div
              className={
                'flex-1 rounded-xl bg-gradient-to-br ' +
                (card.gradient || 'from-charcoal-800 to-charcoal-900') +
                ' aspect-[16/10] p-5 flex flex-col justify-between text-bone-50 shadow-soft ring-1 ring-inset ring-bone-50/10'
              }
            >
              <div className="font-display italic text-sm tracking-wide opacity-90">
                Avenzo
              </div>
              <div>
                <div className="font-display text-4xl font-medium">${finalAmount || 0}</div>
                <div className="text-[10px] uppercase tracking-wider opacity-80 mt-1">{card.name}</div>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-label mb-2">Amount</label>
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
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-avenzo ' +
                    (!useCustom && amount === a
                      ? 'border-brass-400 bg-brass-50 text-brass-700'
                      : 'border-stone-300 hover:border-stone-400')
                  }
                >
                  ${a}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-avenzo ' +
                  (useCustom
                    ? 'border-brass-400 bg-brass-50 text-brass-700'
                    : 'border-stone-300 hover:border-stone-400')
                }
              >
                Custom
              </button>
            </div>
            {useCustom && (
              <div className="mt-3 flex items-center gap-2 max-w-xs">
                <span className="text-charcoal-500">$</span>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter $5 – $500"
                  className="flex-1 rounded-lg border border-stone-300 bg-bone-50 px-3 py-2 text-sm text-charcoal-900 transition-avenzo focus:outline-none focus:border-brass-400"
                />
              </div>
            )}
          </div>

          {/* Delivery method */}
          <div>
            <label className="block text-label mb-2">Delivery method</label>
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
                      'text-left p-3 rounded-lg border transition-avenzo flex items-start gap-2 ' +
                      (active
                        ? 'border-brass-400 bg-brass-50'
                        : 'border-stone-200 hover:border-stone-400')
                    }
                  >
                    <Icon className="w-4 h-4 text-charcoal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-charcoal-900">{d.label}</div>
                      {d.fee && (
                        <div className="text-caption mt-0.5">+${d.fee.toFixed(2)} shipping</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recipient */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Recipient name"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Sarah"
            />
            <Input
              label={`Recipient email${deliveryMethod !== 'email' ? ' (optional)' : ''}`}
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="sarah@example.com"
            />
          </div>

          <Input
            label="From"
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your name"
          />

          <div>
            <label className="block text-label mb-1.5">Personal message (optional)</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              placeholder="Happy Birthday! Hope you love it."
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 resize-none transition-avenzo focus:outline-none focus:border-brass-400"
            />
            <div className="text-caption mt-1 text-right">{message.length}/200</div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-label mb-2">
              <Calendar className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Deliver
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setScheduleNow(true)}
                className={
                  'flex-1 py-2 rounded-lg border text-sm transition-avenzo ' +
                  (scheduleNow
                    ? 'border-brass-400 bg-brass-50 font-medium text-brass-700'
                    : 'border-stone-300 hover:border-stone-400')
                }
              >
                Immediately
              </button>
              <button
                type="button"
                onClick={() => setScheduleNow(false)}
                className={
                  'flex-1 py-2 rounded-lg border text-sm transition-avenzo ' +
                  (!scheduleNow
                    ? 'border-brass-400 bg-brass-50 font-medium text-brass-700'
                    : 'border-stone-300 hover:border-stone-400')
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
                className="rounded-lg border border-stone-300 bg-bone-50 px-3 py-2 text-sm text-charcoal-900 transition-avenzo focus:outline-none focus:border-brass-400"
              />
            )}
          </div>

          {error && (
            <div className="text-sm text-error-700 bg-error-50 border border-error-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary">
              Add to Cart — ${finalAmount || 0}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
