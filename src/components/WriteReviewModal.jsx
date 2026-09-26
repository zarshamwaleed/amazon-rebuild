import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from './Button'
import { createReview } from '../services/reviewService'

export default function WriteReviewModal({ product, onClose, onSubmitted }) {
  const { user, profile } = useAuth()
  const { pushToast } = useToast()

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const displayRating = hoverRating || rating

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return setError('Please sign in to write a review.')
    if (rating < 1) return setError('Please select a star rating.')
    if (body.trim().length < 10) return setError('Your review must be at least 10 characters.')

    setSaving(true)
    setError(null)
    try {
      await createReview({
        productId: product.id,
        userId: user.id,
        authorName: profile?.full_name || 'Verified buyer',
        rating,
        title,
        body,
      })
      pushToast('Review posted', { type: 'success' })
      onSubmitted?.()
    } catch (err) {
      setError(err.message || 'Could not post your review')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-bone-50 rounded-2xl shadow-lifted w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-bone-50 border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <h2 className="heading-sub">Write a review</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition-avenzo"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Product preview */}
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3">
            {product.image_url && (
              <img
                src={product.image_url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover border border-stone-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-av-body-sm font-medium text-charcoal-900 truncate">
                {product.title}
              </div>
            </div>
          </div>

          {!user && (
            <div className="bg-info-50 border border-info-500/20 rounded-xl p-3 text-av-body-sm text-info-700">
              Please{' '}
              <Link to="/login" className="font-medium underline">
                sign in
              </Link>{' '}
              to write a review.
            </div>
          )}

          {/* Star selector */}
          <div>
            <label className="block text-av-label uppercase tracking-wide text-charcoal-600 mb-2">
              Your rating
            </label>
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-0.5"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={
                      'w-7 h-7 transition-avenzo ' +
                      (star <= displayRating
                        ? 'fill-brass-500 text-brass-500'
                        : 'fill-transparent text-stone-300')
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="review-title" className="block text-av-label uppercase tracking-wide text-charcoal-600 mb-1.5">
              Review title <span className="normal-case text-charcoal-400">(optional)</span>
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              maxLength={120}
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400"
            />
          </div>

          {/* Body */}
          <div>
            <label htmlFor="review-body" className="block text-av-label uppercase tracking-wide text-charcoal-600 mb-1.5">
              Your review
            </label>
            <textarea
              id="review-body"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you like or dislike? What did you use this product for?"
              className="w-full rounded-lg border border-stone-300 bg-bone-50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 resize-none transition-avenzo focus:outline-none focus:border-brass-400"
            />
            <p className="text-av-caption text-charcoal-400 mt-1">{body.trim().length}/10 characters minimum</p>
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
            <Button type="submit" variant="secondary" loading={saving} disabled={!user}>
              Post review
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
