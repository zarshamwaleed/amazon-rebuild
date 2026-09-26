// Client-side override for category banner images. Keyed by category slug.
// When a slug has an entry here, the banner uses this URL instead of the
// DB's `categories.image_url` — lets us upgrade banner art without a
// migration. Categories with no entry keep showing their DB image.
const categoryImages = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80',
  books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80',
  'home-kitchen': 'https://images.unsplash.com/photo-1556911073-38141963c9e0?w=1600&q=80',
  fashion: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80',
  'sports-outdoors': 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=1600&q=80',
  'toys-games': 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=1600&q=80',
}

export function getCategoryImageOverride(slug) {
  return (slug && categoryImages[slug]) || null
}

export default categoryImages
