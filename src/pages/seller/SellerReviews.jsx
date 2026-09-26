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
import SellerPageHeader from '../../components/seller/SellerPageHeader'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'

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
    } catch {
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
        result.aiUsed ? 'Analyzed with Groq (Llama 3.3)' : 'Analyzed locally (AI unavailable)',
        { type: 'success' }
      )
    } catch {
      setAnalysis(localReviewAnalysis(reviews))
      pushToast('Could not reach AI. Showing local analysis.', { type: 'info' })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-5">
      <SellerPageHeader
        title="Reviews & Feedback"
        description={`${summary.total} review${summary.total !== 1 ? 's' : ''} across your products.`}
        actions={
          <>
            <Button variant="outline" size="md" onClick={load} aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={runAnalysis}
              disabled={reviews.length === 0}
            >
              <Sparkles className="w-4 h-4" /> Analyze Reviews
            </Button>
          </>
        }
      />

      {/* Summary */}
      <Card>
        <div className="grid md:grid-cols-[200px_1fr] gap-8">
          <div>
            <div className="text-label mb-1">Average rating</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl text-charcoal-900">
                {summary.avg.toFixed(1)}
              </span>
              <span className="text-charcoal-400">/ 5</span>
            </div>
            <div className="mt-2">
              <Rating value={summary.avg} showCount={false} />
            </div>
            <div className="text-caption mt-2">
              Based on {summary.total} review{summary.total !== 1 ? 's' : ''}
            </div>
          </div>

          <div>
            <div className="text-label mb-3">Rating distribution</div>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.counts[star] || 0
                const pct = summary.total > 0 ? (count / summary.total) * 100 : 0
                return (
                  <button
                    key={star}
                    onClick={() => setFilter(String(star))}
                    className="flex items-center gap-3 w-full text-left"
                  >
                    <div className="flex items-center gap-1 w-16 flex-shrink-0">
                      <span className="text-sm text-charcoal-700">{star}</span>
                      <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" />
                    </div>
                    <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-warning-500 transition-avenzo"
                        style={{ width: pct + '%' }}
                      />
                    </div>
                    <span className="text-sm text-charcoal-600 w-20 text-right">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-subtle p-4 flex flex-wrap items-center gap-2">
        <span className="text-label mr-1">Filter</span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={
              'px-3 py-1.5 rounded-full border text-sm transition-avenzo ' +
              (filter === f.id
                ? 'bg-charcoal-900 text-bone-50 border-charcoal-900'
                : 'border-stone-300 hover:border-stone-400 bg-bone-50 text-charcoal-700')
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

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Star}
          title={filter === 'all' ? 'No reviews yet' : `No ${filter}-star reviews`}
          message={
            filter === 'all'
              ? 'Reviews will appear as customers rate your products.'
              : 'Try a different filter.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} hoverable>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {r.product?.image_url ? (
                    <img
                      src={r.product.image_url}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <Link
                      to={`/products/${r.product?.id}`}
                      target="_blank"
                      className="text-sm font-medium text-charcoal-900 hover:text-brass-600 transition-avenzo truncate block max-w-[240px]"
                    >
                      {r.product?.title || 'Unknown product'}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mt-0.5">
                      <span>{r.author_name}</span>
                      <span>·</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" />
                    <span className="text-sm font-medium text-charcoal-900">{r.rating}</span>
                  </span>
                  <Badge color="green">Published</Badge>
                </div>
              </div>

              {r.title && <h4 className="font-medium text-charcoal-900 text-sm mb-1">{r.title}</h4>}
              <p className="text-body-sm">{r.body}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Analysis drawer */}
      {showAnalysis && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-charcoal-900/40" onClick={() => setShowAnalysis(false)} />
          <aside className="w-full max-w-md bg-bone-50 shadow-lifted flex flex-col overflow-hidden animate-fade-in">
            <div className="bg-charcoal-900 text-bone-50 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brass-300" />
                <span className="font-semibold">Review Analysis</span>
              </div>
              <button
                onClick={() => setShowAnalysis(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-avenzo"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-stone-200 bg-stone-50 text-xs text-charcoal-600">
              {analyzing
                ? 'Analyzing with AI…'
                : analysis?.aiUsed
                ? 'Powered by Groq (Llama 3.3)'
                : 'Analyzed locally — AI unavailable'}
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {analyzing && (
                <div className="flex items-center gap-3 text-sm text-charcoal-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reading {Math.min(reviews.length, 40)} reviews…
                </div>
              )}

              {analysis && (
                <>
                  <AnalysisBlock title="Positive Themes" icon={TrendingUp} tone="green" items={analysis.positiveThemes} />
                  <AnalysisBlock title="Negative Themes" icon={TrendingDown} tone="red" items={analysis.negativeThemes} />
                  <AnalysisBlock title="Common Complaints" icon={AlertTriangle} tone="amber" items={analysis.commonComplaints} />
                  <AnalysisBlock title="Customer Requests" icon={Lightbulb} tone="blue" items={analysis.customerRequests} />
                </>
              )}
            </div>

            <div className="border-t border-stone-200 px-5 py-3 text-xs text-charcoal-500">
              AI-generated insights are suggestions. Always verify against raw reviews.
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

const TONE_STYLES = {
  green: { box: 'border-success-500/25 bg-success-50', icon: 'text-success-700' },
  red: { box: 'border-error-500/25 bg-error-50', icon: 'text-error-700' },
  amber: { box: 'border-warning-500/25 bg-warning-50', icon: 'text-warning-700' },
  blue: { box: 'border-info-500/25 bg-info-50', icon: 'text-info-700' },
}

function AnalysisBlock({ title, icon, tone, items }) {
  const Icon = icon
  const styles = TONE_STYLES[tone] || TONE_STYLES.blue
  return (
    <div className={'border rounded-xl p-4 ' + styles.box}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={'w-4 h-4 ' + styles.icon} />
        <h3 className="font-semibold text-charcoal-900 text-sm">{title}</h3>
      </div>
      {items && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm text-charcoal-800">
              <span className={styles.icon}>•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-charcoal-500">No items detected.</p>
      )}
    </div>
  )
}
