import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RefreshCw,
  Star,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getSellerReviews, localReviewAnalysis } from '../../services/sellerService'
import { analyzeReviews } from '../../services/reviewAIService'
import Rating from '../../components/Rating'

const FILTERS = [
  { id: 'all', label: 'All reviews' },
  { id: '5', label: '5 star' },
  { id: '4', label: '4 star' },
  { id: '3', label: '3 star' },
  { id: '2', label: '2 star' },
  { id: '1', label: '1 star' },
]

export default function SellerReviews() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSellerReviews(user.id)
      setReviews(data)
    } catch (err) {
      pushToast('Could not load reviews', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  const filtered = useMemo(() => {
    if (filter === 'all') return reviews
    return reviews.filter((r) => String(r.rating) === filter)
  }, [reviews, filter])

  // Summary stats
  const summary = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let sum = 0
    for (const r of reviews) {
      counts[r.rating] = (counts[r.rating] || 0) + 1
      sum += Number(r.rating) || 0
    }
    const total = reviews.length
    const avg = total > 0 ? sum / total : 0
    return { counts, total, avg }
  }, [reviews])

  async function runAnalysis() {
    if (reviews.length === 0) {
      return pushToast('No reviews to analyze', { type: 'info' })
    }
    setShowAnalysis(true)
    setAnalyzing(true)
    setAnalysis(null)
    try {
      const result = await analyzeReviews(reviews)
      setAnalysis(result)
      pushToast(
        result.aiUsed
          ? 'Analyzed with Groq (Llama 3.3)'
          : 'Analyzed locally (AI unavailable)',
        { type: 'success' }
      )
    } catch (err) {
      setAnalysis(localReviewAnalysis(reviews))
      pushToast('Could not reach AI. Showing local analysis.', { type: 'info' })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Feedback</h1>
          <p className="text-sm text-gray-600">
            {summary.total} review{summary.total !== 1 ? 's' : ''} across your products.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAnalysis}
            disabled={reviews.length === 0}
            className="bg-gradient-to-br from-[#febd69] to-[#f3a847] hover:shadow-md text-gray-900 font-semibold px-4 py-2 rounded flex items-center gap-2 transition text-sm disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" /> Analyze Reviews
          </button>
          <button
            onClick={load}
            className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 grid md:grid-cols-[200px_1fr] gap-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Average rating
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900">
              {summary.avg.toFixed(1)}
            </span>
            <span className="text-gray-500">/ 5</span>
          </div>
          <div className="mt-2">
            <Rating value={summary.avg} />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Based on {summary.total} review{summary.total !== 1 ? 's' : ''}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
            Rating distribution
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.counts[star] || 0
              const pct = summary.total > 0 ? (count / summary.total) * 100 : 0
              return (
                <button
                  key={star}
                  onClick={() => setFilter(String(star))}
                  className="flex items-center gap-3 w-full text-left group"
                >
                  <div className="flex items-center gap-1 w-16 flex-shrink-0">
                    <span className="text-sm text-gray-700">{star}</span>
                    <Star className="w-3.5 h-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                  </div>
                  <div className="flex-1 bg-gray-100 rounded h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ffa41c] to-[#f3a847] transition-all"
                      style={{ width: pct + '%' }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 w-16 text-right">
                    {count} ({Math.round(pct)}%)
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={
              'px-3 py-1.5 rounded-full border text-sm transition ' +
              (filter === f.id
                ? 'bg-[#232f3e] text-white border-[#232f3e]'
                : 'border-gray-300 hover:border-gray-500 bg-white')
            }
          >
            {f.label}
            {f.id !== 'all' && (
              <span className="text-xs ml-1 opacity-70">
                ({summary.counts[Number(f.id)] || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-600">
            Loading reviews…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">
              {filter === 'all'
                ? 'No reviews yet'
                : `No ${filter}-star reviews`}
            </h3>
            <p className="text-sm text-gray-600">
              {filter === 'all'
                ? 'Reviews will appear as customers rate your products.'
                : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-left px-4 py-3">Rating</th>
                  <th className="text-left px-4 py-3">Review</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-center px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {r.product?.image_url ? (
                          <img
                            src={r.product.image_url}
                            alt=""
                            className="w-9 h-9 rounded object-cover border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-100" />
                        )}
                        <Link
                          to={`/products/${r.product?.id}`}
                          target="_blank"
                          className="text-gray-900 hover:text-[#c7511f] truncate max-w-[200px]"
                        >
                          {r.product?.title || 'Unknown product'}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Rating value={Number(r.rating)} />
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      {r.title && (
                        <div className="font-medium text-gray-900 text-sm">
                          {r.title}
                        </div>
                      )}
                      <div className="text-gray-600 text-xs line-clamp-2">
                        {r.body}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        — {r.author_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        Published
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analysis drawer */}
      {showAnalysis && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setShowAnalysis(false)}
          />
          <aside className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#febd69]" />
                <span className="font-bold">Review Analysis</span>
              </div>
              <button
                onClick={() => setShowAnalysis(false)}
                className="p-1 rounded hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 border-b bg-gray-50 text-xs text-gray-600">
              {analyzing
                ? 'Analyzing with AI…'
                : analysis?.aiUsed
                ? 'Powered by Groq (Llama 3.3)'
                : 'Analyzed locally — AI unavailable'}
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {analyzing && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reading {Math.min(reviews.length, 40)} reviews…
                </div>
              )}

              {analysis && (
                <>
                  <AnalysisBlock
                    title="Positive Themes"
                    icon={TrendingUp}
                    tone="green"
                    items={analysis.positiveThemes}
                  />
                  <AnalysisBlock
                    title="Negative Themes"
                    icon={TrendingDown}
                    tone="red"
                    items={analysis.negativeThemes}
                  />
                  <AnalysisBlock
                    title="Common Complaints"
                    icon={AlertTriangle}
                    tone="amber"
                    items={analysis.commonComplaints}
                  />
                  <AnalysisBlock
                    title="Customer Requests"
                    icon={Lightbulb}
                    tone="blue"
                    items={analysis.customerRequests}
                  />
                </>
              )}
            </div>

            <div className="border-t px-5 py-3 text-xs text-gray-500">
              AI-generated insights are suggestions. Always verify against raw reviews.
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function AnalysisBlock({ title, icon: Icon, tone, items }) {
  const toneCls =
    tone === 'green'
      ? 'border-green-200 bg-green-50'
      : tone === 'red'
      ? 'border-red-200 bg-red-50'
      : tone === 'amber'
      ? 'border-amber-200 bg-amber-50'
      : 'border-blue-200 bg-blue-50'
  const iconCls =
    tone === 'green'
      ? 'text-green-600'
      : tone === 'red'
      ? 'text-red-600'
      : tone === 'amber'
      ? 'text-amber-600'
      : 'text-blue-600'
  return (
    <div className={'border rounded-lg p-4 ' + toneCls}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={'w-4 h-4 ' + iconCls} />
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </div>
      {items && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-800">
              <span className={iconCls}>•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500">No items detected.</p>
      )}
    </div>
  )
}