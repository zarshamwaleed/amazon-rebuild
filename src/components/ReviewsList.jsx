import Rating from './Rating'

const SAMPLE_REVIEWS = [
  {
    author: 'Alex M.',
    rating: 5,
    title: 'Excellent quality',
    body: 'Exceeded my expectations. Shipping was fast and the product works perfectly.',
    date: '2 weeks ago',
  },
  {
    author: 'Priya S.',
    rating: 4,
    title: 'Great value for money',
    body: 'Very good product for the price. Would recommend to friends and family.',
    date: '1 month ago',
  },
  {
    author: 'Jordan K.',
    rating: 5,
    title: 'Highly recommend',
    body: 'Exactly as described. Packaging was excellent and delivery was on time.',
    date: '2 months ago',
  },
]

export default function ReviewsList({ rating, reviewCount }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Rating value={rating} size="lg" />
        <span className="text-sm text-gray-700">
          {Number(rating).toFixed(1)} out of 5
        </span>
        <span className="text-sm text-gray-500">
          {reviewCount ? reviewCount.toLocaleString() + ' global ratings' : 'No ratings yet'}
        </span>
      </div>

      <div className="space-y-4">
        {SAMPLE_REVIEWS.map((r, i) => (
          <div key={i} className="border-t pt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">{r.author}</span>
              <span className="text-xs text-gray-500">· {r.date}</span>
            </div>
            <Rating value={r.rating} />
            <h4 className="font-semibold text-sm text-gray-900 mt-1">{r.title}</h4>
            <p className="text-sm text-gray-700 mt-1">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
