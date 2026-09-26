import { useEffect, useState } from 'react'
import Rating from './Rating'
import Reveal from './home/Reveal'
import { getProductReviews, getProductRatingSummary } from '../services/reviewService'

export default function ReviewsList({ productId, rating: fallbackRating, reviewCount: fallbackCount, refreshKey }) {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [revs, sum] = await Promise.all([
          getProductReviews(productId, 10),
          getProductRatingSummary(productId),
        ])
        if (cancelled) return
        setReviews(revs)
        setSummary(sum)
      } catch (err) {
        console.warn('[reviews]', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [productId, refreshKey])

  // Fall back to product.rating if there are no DB reviews
  const displayRating = summary?.average || fallbackRating || 0
  const displayTotal = summary?.total || fallbackCount || 0

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="skeleton-shimmer h-40 rounded-xl" />
        <div className="md:col-span-2 space-y-3">
          <div className="skeleton-shimmer h-24 rounded-xl" />
          <div className="skeleton-shimmer h-24 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Summary + breakdown */}
      <div className="md:col-span-1">
        <div className="font-display text-display-sm text-charcoal-900 leading-none">
          {Number(displayRating).toFixed(1)}
        </div>
        <Rating value={displayRating} size="lg" showCount={false} className="mt-2" />
        <div className="text-caption mt-2">
          {displayTotal > 0
            ? displayTotal.toLocaleString() + ' global ratings'
            : 'No ratings yet'}
        </div>

        {summary && summary.total > 0 && (
          <div className="space-y-2 mt-5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.breakdown[star] || 0
              const pct = summary.total > 0 ? (count / summary.total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2.5 text-av-caption">
                  <span className="w-9 text-charcoal-600">{star} star</span>
                  <div className="flex-1 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brass-500 h-full rounded-full transition-avenzo duration-slower"
                      style={{ width: pct + '%' }}
                    />
                  </div>
                  <span className="w-9 text-right text-charcoal-500">{Math.round(pct)}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Editorial review cards */}
      <div className="md:col-span-2">
        <h3 className="heading-sub mb-4">Top reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-body-sm">No written reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <Reveal key={r.id} variant="up" delay={Math.min(i, 6) * 60}>
                <div className="bg-bone-50 border border-stone-200 rounded-xl p-5 transition-avenzo hover:border-stone-300 hover:shadow-subtle">
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="w-8 h-8 rounded-full bg-brass-100 text-brass-700 text-av-label font-semibold flex items-center justify-center shrink-0">
                      {(r.author_name || '?').trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="text-av-body-sm font-medium text-charcoal-900 truncate">
                        {r.author_name}
                      </div>
                      <div className="text-av-caption text-charcoal-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Rating value={r.rating} size="sm" showCount={false} />
                  {r.title && (
                    <h4 className="font-display text-heading-sub text-charcoal-900 mt-2">
                      {r.title}
                    </h4>
                  )}
                  <p className="text-body-sm mt-1.5 leading-relaxed">{r.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
