import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, Send, Sparkles, Loader2, ShoppingCart, Star } from 'lucide-react'
import { supabase } from '../services/supabase'
import { askAlexa } from '../services/alexaService'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const SUGGESTIONS = [
  'Find me wireless headphones under $100',
  "What's good for a home office?",
  'Compare the top rated electronics',
  'Show me books under $20',
  'Add the first one to my cart',
]

const GREETING =
  "Hi! I'm Alexa for Shopping. Ask me anything — I can search products, compare options, add items to your cart, and help you decide."

export default function AlexaShopping() {
  const { addItem } = useCart()
  const { pushToast } = useToast()

  const [messages, setMessages] = useState([
    { role: 'assistant', text: GREETING },
  ])
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [catalog, setCatalog] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
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
    rec.onerror = () => pushToast('Voice input failed', { type: 'error' })
    rec.start()
    pushToast('Listening…', { type: 'info' })
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white rounded-lg p-6 md:p-8 mb-5">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-[#febd69]" />
          <h1 className="text-2xl md:text-3xl font-bold">Alexa for Shopping</h1>
        </div>
        <p className="text-gray-200 text-sm md:text-base">
          Ask me to find products, compare options, or add items to your cart.
          Powered by Groq.
        </p>
      </div>

      {/* Chat */}
      <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-[600px]">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
        >
          {messages.map((m, i) => (
            <Message key={i} message={m} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Alexa is thinking…
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-[#febd69]"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask Alexa anything about shopping…"
              className="flex-1 text-sm focus:outline-none"
              disabled={busy}
            />
            <button
              type="button"
              onClick={handleMic}
              className="text-gray-500 hover:text-gray-800 p-1"
              aria-label="Voice input"
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!q.trim() || busy}
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 rounded px-3 py-1.5 flex items-center gap-1 text-sm font-medium disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>

          {/* Suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={busy}
                className="text-xs border border-gray-300 hover:bg-gray-50 rounded-full px-3 py-1.5 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Message({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={'flex ' + (isUser ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[80%] space-y-3">
        <div
          className={
            'rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ' +
            (isUser
              ? 'bg-[#232f3e] text-white'
              : 'bg-gray-100 text-gray-800')
          }
        >
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#c7511f] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Alexa
            </div>
          )}
          {message.text}
        </div>

        {message.products && message.products.length > 0 && (
          <div
            className={
              'grid gap-3 ' +
              (message.products.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 sm:grid-cols-2')
            }
          >
            {message.products.map((p) => (
              <ProductSuggestion key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductSuggestion({ product }) {
  const { addItem } = useCart()
  const { pushToast } = useToast()

  function handleAdd() {
    if (product.stock === 0) {
      pushToast('Out of stock', { type: 'error' })
      return
    }
    addItem(product, 1)
    pushToast(`Added "${product.title}" to cart`, { type: 'success' })
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex">
      <Link
        to={`/products/${product.id}`}
        className="w-24 flex-shrink-0 bg-gray-50"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </Link>
      <div className="flex-1 p-3 min-w-0 flex flex-col">
        <Link
          to={`/products/${product.id}`}
          className="text-sm font-medium text-gray-900 hover:text-[#c7511f] line-clamp-2"
        >
          {product.title}
        </Link>
        {product.brand && (
          <div className="text-xs text-gray-500 mt-0.5">{product.brand}</div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-base font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.rating > 0 && (
            <span className="text-xs text-gray-600 flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-[#ffa41c] text-[#ffa41c]" />
              {Number(product.rating).toFixed(1)}
            </span>
          )}
        </div>
        <div className="mt-auto pt-2 flex items-center gap-2">
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="text-xs bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium px-3 py-1.5 rounded flex items-center gap-1 disabled:opacity-50"
          >
            <ShoppingCart className="w-3 h-3" />
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
          <Link
            to={`/products/${product.id}`}
            className="text-xs text-[#007185] hover:underline"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}