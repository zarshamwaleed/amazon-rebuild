import { useState } from 'react'
import {
  Sparkles,
  X,
  TrendingUp,
  Send,
  ExternalLink,
} from 'lucide-react'
import { askGrowthAssistant } from '../../services/aiService'
import { useToast } from '../../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import Badge from '../Badge'

const SUGGESTIONS = [
  'What should I focus on this week?',
  'How can I increase sales fastest?',
  'Which product needs the most attention?',
  'Where am I losing money?',
]

const PRIORITY_COLOR = {
  High: 'red',
  Medium: 'yellow',
  Low: 'gray',
}

export default function AIGrowthAssistant({ growthData }) {
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  function buildSnapshot() {
    if (!growthData) return { metrics: {}, topProducts: [], topOpportunities: [] }
    const { metrics, topProducts, opportunities, summary } = growthData
    return {
      metrics,
      summary,
      topProducts: (topProducts || []).slice(0, 10).map((row) => ({
        title: row.product?.title || 'Untitled',
        sales: +Number(row.sales).toFixed(2),
        units: row.units,
        stock: row.product?.stock ?? 0,
        conversion: +row.conversion.toFixed(2),
        rating: row.product?.rating || 0,
        reviewCount: row.product?.review_count || 0,
      })),
      topOpportunities: (opportunities || []).slice(0, 10).map((o) => ({
        productTitle: o.productTitle,
        category: o.category,
        title: o.title,
        description: o.description,
        impact: o.impact,
        estimatedValue: Math.round(o.estimatedValue || 0),
        recommendedAction: o.recommendedAction,
        actionLink: o.actionLink,
      })),
    }
  }

  async function ask(text) {
    const message = (text ?? q).trim()
    if (!message || busy) return
    setQ('')
    setBusy(true)
    setResult(null)
    try {
      const snapshot = buildSnapshot()
      const r = await askGrowthAssistant({
        question: message,
        snapshot,
        history,
      })
      setResult({ ...r, question: message })
      setHistory((h) => [...h, { role: 'user', text: message }].slice(-6))
      pushToast(
        r.aiUsed ? 'Answered with Groq AI' : 'Answered from your data',
        { type: 'success' }
      )
    } catch (err) {
      console.error('[askGrowthAssistant]', err)
      pushToast('Could not reach AI — showing top opportunities', { type: 'info' })
      const snapshot = buildSnapshot()
      setResult({
        summary: 'Here are your top opportunities.',
        recommendations: (snapshot.topOpportunities || []).slice(0, 4).map((o) => ({
          productTitle: o.productTitle,
          action: o.title,
          why: o.description,
          priority: o.impact,
          actionLink: o.actionLink,
        })),
        question: message,
        aiUsed: false,
      })
    } finally {
      setBusy(false)
    }
  }

  function handleTakeAction(link) {
    if (!link) return
    setOpen(false)
    navigate(link)
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-charcoal-900 text-bone-50 font-medium pl-3 pr-5 py-2.5 rounded-full shadow-lifted hover:bg-charcoal-800 transition-avenzo flex items-center gap-2.5"
      >
        <span className="w-6 h-6 rounded-full bg-brass-50 text-brass-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
        AI Growth Assistant
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-charcoal-900/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="w-full max-w-md bg-bone-50 shadow-lifted flex flex-col overflow-hidden animate-scale-in origin-right">
            {/* Header */}
            <div className="bg-charcoal-900 text-bone-50 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-brass-50 text-brass-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="font-semibold">AI Growth Assistant</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-avenzo"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* AI-powered accent strip */}
            <div className="h-[3px] bg-gradient-to-r from-brass-500 via-brass-300 to-transparent flex-shrink-0" />

            <div className="px-5 py-3 text-xs text-charcoal-500 border-b border-stone-200 bg-stone-50 flex-shrink-0">
              Powered by Groq (Llama 3.3). Analyzes your products, orders, and
              opportunities — never your customers' personal data.
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {!result && !busy && (
                <>
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-brass-50 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-brass-600" />
                    </div>
                    <h3 className="heading-sub mb-1">
                      Ask me anything about your business
                    </h3>
                    <p className="text-body-sm">
                      I'll analyze your real data and prioritize what matters most.
                    </p>
                  </div>

                  <div>
                    <p className="text-label mb-2">Try asking</p>
                    <div className="space-y-1.5">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => ask(s)}
                          className="w-full text-left text-sm px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-avenzo text-charcoal-800"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {busy && (
                <div className="flex items-center gap-3 text-body-sm py-6">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brass-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brass-400 animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brass-400 animate-pulse [animation-delay:300ms]" />
                  </span>
                  Analyzing your business…
                </div>
              )}

              {result && (
                <>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-charcoal-900 text-bone-50 rounded-xl rounded-br-sm px-4 py-2.5 text-sm">
                      {result.question}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-stone-100 text-charcoal-800 rounded-xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed">
                      {result.summary}
                    </div>
                  </div>

                  {result.recommendations?.length > 0 && (
                    <div>
                      <div className="text-label mb-2">Recommended actions</div>
                      <ul className="space-y-3">
                        {result.recommendations.map((r, i) => (
                          <li key={i} className="border border-stone-200 rounded-lg p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-semibold text-charcoal-900 leading-snug">
                                {r.action}
                              </div>
                              <Badge color={PRIORITY_COLOR[r.priority] || 'gray'} className="flex-shrink-0">
                                {r.priority}
                              </Badge>
                            </div>
                            <div className="text-xs text-charcoal-500 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {r.productTitle}
                            </div>
                            <p className="text-sm text-charcoal-700">{r.why}</p>
                            <button
                              onClick={() => handleTakeAction(r.actionLink)}
                              className="text-sm font-medium text-brass-600 hover:text-brass-700 transition-avenzo flex items-center gap-1"
                            >
                              Take action <ExternalLink className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => setResult(null)}
                    className="w-full text-sm text-charcoal-600 hover:text-charcoal-900 transition-avenzo pt-2"
                  >
                    Ask another question
                  </button>

                  {!result.aiUsed && (
                    <div className="text-xs text-charcoal-500 bg-stone-50 border border-stone-200 rounded-lg p-2 text-center">
                      AI unavailable — showing top opportunities from your data.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-stone-200 p-3 flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  ask()
                }}
                className="flex items-center gap-2 border border-stone-300 rounded-lg px-3 py-2 transition-avenzo focus-within:border-brass-400 focus-within:shadow-focus-ring"
              >
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ask anything about your business…"
                  className="flex-1 text-sm bg-transparent focus:outline-none text-charcoal-900 placeholder:text-charcoal-400"
                  disabled={busy}
                />
                <button
                  type="submit"
                  disabled={!q.trim() || busy}
                  className="bg-charcoal-900 hover:bg-charcoal-800 text-bone-50 rounded-lg px-3 py-1.5 flex items-center gap-1 text-sm font-medium disabled:opacity-50 transition-avenzo"
                  aria-label="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
