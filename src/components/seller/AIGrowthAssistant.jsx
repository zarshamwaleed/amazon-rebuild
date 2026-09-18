import { useState } from 'react'
import {
  Sparkles,
  X,
  Loader2,
  TrendingUp,
  Send,
  ExternalLink,
} from 'lucide-react'
import { askGrowthAssistant } from '../../services/aiService'
import { useToast } from '../../context/ToastContext'
import { useNavigate } from 'react-router-dom'

const SUGGESTIONS = [
  'What should I focus on this week?',
  'How can I increase sales fastest?',
  'Which product needs the most attention?',
  'Where am I losing money?',
]

const PRIORITY_STYLES = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-gray-100 text-gray-700',
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
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-[#febd69] to-[#f3a847] text-gray-900 font-semibold px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        AI Growth Assistant
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#febd69]" />
                <span className="font-bold">AI Growth Assistant</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 text-xs text-gray-600 border-b bg-gray-50">
              Powered by Groq (Llama 3.3). Analyzes your products, orders, and
              opportunities — never your customers' personal data.
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {!result && !busy && (
                <>
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-[#c7511f]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Ask me anything about your business
                    </h3>
                    <p className="text-sm text-gray-600">
                      I'll analyze your real data and prioritize what matters most.
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                      Try asking
                    </p>
                    <div className="space-y-1.5">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => ask(s)}
                          className="w-full text-left text-sm px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 hover:border-gray-400 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {busy && (
                <div className="flex items-center gap-3 text-sm text-gray-600 py-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing your business…
                </div>
              )}

              {result && (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-xs uppercase tracking-wider text-[#c7511f] font-bold mb-1">
                      Your question
                    </div>
                    <div className="text-sm text-gray-900">
                      {result.question}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                      Answer
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  {result.recommendations?.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                        Recommended actions
                      </div>
                      <ul className="space-y-3">
                        {result.recommendations.map((r, i) => (
                          <li
                            key={i}
                            className="border border-gray-200 rounded-lg p-4 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-bold text-gray-900 leading-snug">
                                {r.action}
                              </div>
                              <span
                                className={
                                  'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex-shrink-0 ' +
                                  PRIORITY_STYLES[r.priority]
                                }
                              >
                                {r.priority}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {r.productTitle}
                            </div>
                            <p className="text-sm text-gray-700">{r.why}</p>
                            <button
                              onClick={() => handleTakeAction(r.actionLink)}
                              className="text-sm font-medium text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1"
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
                    className="w-full text-sm text-[#007185] hover:underline pt-2"
                  >
                    Ask another question
                  </button>

                  {!result.aiUsed && (
                    <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-2 text-center">
                      AI unavailable — showing top opportunities from your data.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Composer */}
            <div className="border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  ask()
                }}
                className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-[#febd69]"
              >
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ask anything about your business…"
                  className="flex-1 text-sm focus:outline-none"
                  disabled={busy}
                />
                <button
                  type="submit"
                  disabled={!q.trim() || busy}
                  className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 rounded px-3 py-1.5 flex items-center gap-1 text-sm font-medium disabled:opacity-50"
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