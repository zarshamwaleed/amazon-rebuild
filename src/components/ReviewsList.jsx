import { useEffect, useState } from 'react'
import Rating from './Rating'
import { getProductReviews, getProductRatingSummary } from '../services/reviewService'

export default function ReviewsList({ productId, rating: fallbackRating, reviewCount: fallbackCount }) {
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
  }, [productId])

  // Fall back to product.rating if there are no DB reviews
  const displayRating = summary?.average || fallbackRating || 0
  const displayTotal = summary?.total || fallbackCount || 0

  if (loading) {
    return <div className="text-sm text-gray-500 py-4">Loading reviews…</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left: summary + breakdown */}
      <div className="md:col-span-1">
        <div className="flex items-center gap-3 mb-3">
          <Rating value={displayRating} size="lg" />
          <span className="text-sm text-gray-700">
            {Number(displayRating).toFixed(1)} out of 5
          </span>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          {displayTotal > 0
            ? displayTotal.toLocaleString() + ' global ratings'
            : 'No ratings yet'}
        </div>

        {summary && summary.total > 0 && (
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.breakdown[star] || 0
              const pct = summary.total > 0 ? (count / summary.total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-gray-700">{star} star</span>
                  <div className="flex-1 bg-gray-200 rounded h-3 overflow-hidden">
                    <div
                      className="bg-[#ffa41c] h-full"
                      style={{ width: pct + '%' }}
                    />
                  </div>
                  <span className="w-10 text-right text-gray-700">{Math.round(pct)}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: review cards */}
      <div className="md:col-span-2">
        <h3 className="font-bold text-gray-900 mb-4">Top reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No written reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{r.author_name}</span>
                  <span className="text-xs text-gray-500">
                    · {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Rating value={r.rating} />
                {r.title && (
                  <h4 className="font-semibold text-sm text-gray-900 mt-1">{r.title}</h4>
                )}
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
