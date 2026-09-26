import { useState } from 'react'
import { X, RotateCcw, Check } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import { useToast } from '../../context/ToastContext'
import {
  updateOrderStatus,
  createSellerRefund,
  getBuyerProfile,
} from '../../services/sellerService'
import { sendSellerOrderMessage } from '../../services/messageService'

const REASONS = [
  'Item not received',
  'Item damaged',
  'Item not as described',
  'Customer request',
  'Goodwill',
  'Other',
]

export default function RefundModal({ order, sellerTotal, sellerId, onClose, onRefunded }) {
  const { pushToast } = useToast()

  const [refundType, setRefundType] = useState('full')
  const [amount, setAmount] = useState(sellerTotal.toFixed(2))
  const [reason, setReason] = useState(REASONS[0])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const shortId = order.id.slice(0, 8)
  const numericAmount = Number(amount) || 0

  function handleTypeChange(type) {
    setRefundType(type)
    if (type === 'full') setAmount(sellerTotal.toFixed(2))
  }

  async function handleSubmit() {
    if (numericAmount <= 0 || numericAmount > sellerTotal) {
      setError(`Enter an amount between $0.01 and $${sellerTotal.toFixed(2)}.`)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const updated = await updateOrderStatus(order.id, 'refunded')
      if (!updated) {
        throw new Error('Refund blocked — check RLS policies on the orders table.')
      }

      try {
        await createSellerRefund(sellerId, {
          orderId: order.id,
          amount: numericAmount,
          refundType,
          reason,
          notes: notes.trim() || null,
        })
      } catch (refundErr) {
        console.warn('[refund] could not record seller_refunds row:', refundErr)
      }

      try {
        const buyer = await getBuyerProfile(order.user_id)
        await sendSellerOrderMessage({
          sellerId,
          orderId: order.id,
          customerName: buyer?.full_name || order.addresses?.full_name || null,
          customerEmail: buyer?.email || null,
          subject: `Refund issued — Order #${shortId}`,
          body: `We've issued a ${refundType === 'full' ? 'full' : 'partial'} refund of $${numericAmount.toFixed(2)} for this order.${
            reason ? ` Reason: ${reason}.` : ''
          }${notes.trim() ? ` Note: ${notes.trim()}` : ''}`,
        })
      } catch (msgErr) {
        console.warn('[refund] could not send customer notification:', msgErr)
      }

      pushToast(`Refund of $${numericAmount.toFixed(2)} issued`, { type: 'success' })
      onRefunded?.()
      onClose?.()
    } catch (err) {
      setError(err.message || 'Could not issue refund')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brass-600" />
            <h2 className="heading-sub">Issue Refund — Order #{shortId}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm space-y-1.5">
            <div className="flex justify-between text-charcoal-700">
              <span>Order total</span>
              <span className="font-medium text-charcoal-900">
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-charcoal-700">
              <span>Your subtotal (this order)</span>
              <span className="font-medium text-charcoal-900">${sellerTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-700">
              <span>Payment status</span>
              <span className="font-medium text-charcoal-900 capitalize">
                {order.payment_status}
              </span>
            </div>
          </div>

          {/* Refund type */}
          <div>
            <label className="block text-av-label uppercase tracking-wide text-charcoal-600 mb-2">
              Refund type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'full', label: 'Full refund' },
                { id: 'partial', label: 'Partial refund' },
              ].map((t) => {
                const selected = refundType === t.id
                return (
                  <label
                    key={t.id}
                    className={
                      'flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-avenzo ' +
                      (selected
                        ? 'border-brass-400 bg-brass-50'
                        : 'border-stone-200 hover:border-stone-400')
                    }
                  >
                    <input
                      type="radio"
                      name="refund_type"
                      value={t.id}
                      checked={selected}
                      onChange={() => handleTypeChange(t.id)}
                      className="sr-only"
                    />
                    <span
                      className={
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ' +
                        (selected ? 'border-brass-500' : 'border-stone-300')
                      }
                    >
                      {selected && <span className="w-2 h-2 rounded-full bg-brass-500" />}
                    </span>
                    <span className="text-sm font-medium text-charcoal-900">{t.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Amount */}
          <Input
            label="Refund amount"
            type="number"
            step="0.01"
            min="0.01"
            max={sellerTotal}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={refundType === 'full'}
            hint={`Up to $${sellerTotal.toFixed(2)} (your portion of this order)`}
          />

          {/* Reason */}
          <div>
            <label className="block text-av-label uppercase tracking-wide text-charcoal-600 mb-1.5">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 transition-avenzo focus:outline-none focus:border-brass-400"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-av-label uppercase tracking-wide text-charcoal-600 mb-1.5">
              Notes <span className="text-charcoal-400 normal-case">(optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={200}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any context for the customer or your records…"
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 resize-none transition-avenzo focus:outline-none focus:border-brass-400"
            />
            <div className="text-caption mt-1 text-right">{notes.length}/200</div>
          </div>

          {error && (
            <div className="text-av-body-sm text-error-700 bg-error-50 border border-error-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleSubmit} loading={submitting}>
              <Check className="w-4 h-4" />
              {submitting ? 'Issuing…' : 'Issue Refund'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
