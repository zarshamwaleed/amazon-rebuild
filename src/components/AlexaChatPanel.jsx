import { useEffect, useRef, useState } from 'react'
import { Mic, Send, Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '../services/supabase'
import { askAlexa } from '../services/alexaService'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import ProductGrid from './ProductGrid'
import Button from './Button'

const SUGGESTIONS = [
  'Find me wireless headphones under $100',
  "What's good for a home office?",
  'Compare the top rated electronics',
  'Show me books under $20',
  'Add the first one to my cart',
]

const GREETING =
  "Hi! I'm Alexa for Shopping. Ask me anything — I can search products, compare options, add items to your cart, and help you decide."

/**
 * Full Alexa chat experience — messages, composer, suggestions.
 * Shared by the full /alexa-shopping page and the slide-in drawer.
 */
export default function AlexaChatPanel({ onCatalogLoadingChange }) {
  const { addItem } = useCart()
  const { pushToast } = useToast()

  const [messages, setMessages] = useState([
    { role: 'assistant', text: GREETING },
  ])
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [catalog, setCatalog] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [listening, setListening] = useState(false)
  const scrollRef = useRef(null)

  // Load full product catalog once — Alex uses this as context
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await supabase
          .from('products')
          .select('id, title, price, brand, rating, description, image_url, stock')
          .order('rating', { ascending: false })
          .limit(60)
        if (!cancelled) setCatalog(data || [])
      } catch {
        // silent — alexa can still answer generic questions
      } finally {
        if (!cancelled) setCatalogLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    onCatalogLoadingChange?.(catalogLoading)
  }, [catalogLoading, onCatalogLoadingChange])

  // Auto-scroll to the bottom when a message is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, busy])

  async function send(text) {
    const message = (text ?? q).trim()
    if (!message || busy) return
    setQ('')

    const history = messages.map((m) => ({ role: m.role, text: m.text }))
    setMessages((prev) => [...prev, { role: 'user', text: message }])
    setBusy(true)

    try {
      const reply = await askAlexa({
        message,
        history,
        products: catalog,
      })

      // Resolve product IDs to full product objects
      const matched = (reply.product_ids || [])
        .map((id) => catalog.find((p) => p.id === id))
        .filter(Boolean)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply.text,
          products: matched,
          action: reply.action,
          action_product_id: reply.action_product_id,
        },
      ])

      // Auto-execute add_to_cart
      if (reply.action === 'add_to_cart' && reply.action_product_id) {
        const product = catalog.find((p) => p.id === reply.action_product_id)
        if (product) {
          if (product.stock === 0) {
            pushToast('That product is out of stock', { type: 'error' })
          } else {
            addItem(product, 1)
            pushToast(`Added "${product.title}" to your cart`, { type: 'success' })
          }
        }
      }
    } catch (err) {
      const msg =
        err.message?.includes('429') || err.message?.includes('rate')
          ? 'I hit a rate limit — try again in a few seconds.'
          : 'Sorry, I had trouble answering that. Please try again.'
      setMessages((prev) => [...prev, { role: 'assistant', text: msg }])
    } finally {
      setBusy(false)
    }
  }

  function handleMic() {
    const Rec =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!Rec) {
      pushToast('Voice input not supported in this browser', { type: 'info' })
      return
    }
    const rec = new Rec()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setQ(text)
    }
    rec.onerror = () => {
      pushToast('Voice input failed', { type: 'error' })
      setListening(false)
    }
    rec.onend = () => setListening(false)
    rec.start()
    setListening(true)
    pushToast('Listening…', { type: 'info' })
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 space-y-6"
      >
        {messages.map((m, i) => (
          <Message key={i} message={m} />
        ))}
        {busy && (
          <div className="flex items-center gap-2.5 text-charcoal-400">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brass-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brass-500" />
            </span>
            <span className="text-av-body-sm">Alexa is thinking…</span>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-stone-200 bg-bone-100/60 p-3.5 md:p-4 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 flex items-center gap-1.5 bg-bone-50 border border-stone-300 rounded-full pl-4 pr-1.5 py-1.5 transition-avenzo focus-within:border-brass-400 focus-within:shadow-focus-ring">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask Alexa anything about shopping…"
              className="flex-1 min-w-0 bg-transparent text-av-body-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
              disabled={busy}
            />
            <button
              type="button"
              onClick={handleMic}
              aria-label="Voice input"
              aria-pressed={listening}
              title="Voice input"
              className={
                'relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-avenzo ' +
                (listening
                  ? 'bg-brass-500 text-bone-50'
                  : 'text-charcoal-500 hover:text-charcoal-800 hover:bg-stone-100')
              }
            >
              {listening && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-brass-400 animate-ping opacity-60"
                />
              )}
              <Mic className="relative w-4 h-4" />
            </button>
          </div>
          <Button
            type="submit"
            variant="secondary"
            disabled={!q.trim() || busy}
            aria-label="Send"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>

        {/* Suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="text-av-caption border border-stone-300 hover:border-brass-400 hover:bg-brass-50 text-charcoal-600 hover:text-charcoal-900 rounded-full px-3 py-1.5 transition-avenzo disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={'flex ' + (isUser ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[85%] sm:max-w-[80%] space-y-3.5">
        {isUser ? (
          <div className="rounded-2xl rounded-tr-md bg-charcoal-900 text-bone-50 px-4 py-3 text-av-body-sm whitespace-pre-wrap">
            {message.text}
          </div>
        ) : (
          <div className="relative pl-4">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0.5 bottom-0.5 w-[3px] rounded-full bg-gradient-to-b from-brass-400 via-brass-500 to-brass-500/10"
            />
            <div className="flex items-center gap-1.5 mb-1.5 text-av-label uppercase tracking-wide font-medium text-brass-700">
              <Sparkles className="w-3 h-3" />
              Alexa
            </div>
            <div className="rounded-2xl rounded-tl-md bg-stone-100 text-charcoal-800 px-4 py-3 text-av-body-sm whitespace-pre-wrap">
              {message.text}
            </div>
          </div>
        )}

        {message.products && message.products.length > 0 && (
          <div className={isUser ? '' : 'pl-4'}>
            <ProductGrid products={message.products} cols={2} />
          </div>
        )}
      </div>
    </div>
  )
}
