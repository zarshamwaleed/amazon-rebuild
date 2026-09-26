import { useEffect, useState } from 'react'
import { X, MessageCircle, Send } from 'lucide-react'
import Button from '../Button'
import { useToast } from '../../context/ToastContext'
import { getBuyerProfile } from '../../services/sellerService'
import { getOrderMessages, sendSellerOrderMessage } from '../../services/messageService'

export default function ContactCustomerModal({ order, sellerId, onClose }) {
  const { pushToast } = useToast()

  const [messages, setMessages] = useState([])
  const [buyer, setBuyer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const shortId = order.id.slice(0, 8)

  async function load() {
    try {
      setLoading(true)
      const [msgs, profile] = await Promise.all([
        getOrderMessages(sellerId, order.id),
        getBuyerProfile(order.user_id).catch(() => null),
      ])
      setMessages(msgs)
      setBuyer(profile)
    } catch {
      pushToast('Could not load messages', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id, sellerId])

  async function handleSend() {
    if (!body.trim()) return
    setSending(true)
    try {
      await sendSellerOrderMessage({
        sellerId,
        orderId: order.id,
        customerName: buyer?.full_name || order.addresses?.full_name || null,
        customerEmail: buyer?.email || null,
        body: body.trim(),
      })
      setBody('')
      await load()
    } catch {
      pushToast('Could not send message', { type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const buyerName = buyer?.full_name || order.addresses?.full_name || 'Customer'
  const buyerEmail = buyer?.email || null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-lg animate-scale-in flex flex-col max-h-[85vh]">
        <div className="border-b border-stone-200 px-5 py-4 flex items-start justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-brass-600" />
              <h2 className="heading-sub">Messages — Order #{shortId}</h2>
            </div>
            <p className="text-caption mt-1">
              {buyerName}
              {buyerEmail ? ` · ${buyerEmail}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition-avenzo -mt-1"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-stone-50 min-h-[240px]">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-body-sm text-center py-8">
              No messages yet. Send the first message to this customer below.
            </div>
          ) : (
            messages.map((m) => {
              const fromSeller = m.direction === 'outbound'
              return (
                <div
                  key={m.id}
                  className={'flex animate-fade-in-up ' + (fromSeller ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={
                      'max-w-[80%] px-4 py-3 shadow-soft ' +
                      (fromSeller
                        ? 'bg-charcoal-900 text-bone-50 rounded-2xl rounded-br-sm'
                        : 'bg-bone-50 text-charcoal-800 border border-stone-200 rounded-2xl rounded-bl-sm')
                    }
                  >
                    <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                    <div className={'text-metadata mt-1.5 ' + (fromSeller ? 'text-bone-300' : '')}>
                      {fromSeller ? 'You' : buyerName} · {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-stone-200 p-4 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-end gap-2"
          >
            <textarea
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Message this customer…"
              className="flex-1 rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 resize-none transition-avenzo focus:outline-none focus:border-brass-400"
            />
            <Button
              type="submit"
              variant="secondary"
              size="md"
              loading={sending}
              disabled={!body.trim()}
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending…' : 'Send'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
