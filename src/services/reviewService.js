import { supabase } from './supabase'

export async function getProductReviews(productId, limit = 10) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

/**
 * Returns { average, total, breakdown: { 5: n, 4: n, 3: n, 2: n, 1: n } }
 */
export async function getProductRatingSummary(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
  if (error) throw error

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let total = 0
  let sum = 0
  for (const r of data || []) {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1
    total += 1
    sum += r.rating
  }
  const average = total > 0 ? sum / total : 0
  return { average, total, breakdown }
}

export async function createReview({ productId, userId, authorName, rating, title, body }) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: userId,
      author_name: authorName,
      rating,
      title: title?.trim() || null,
      body: body.trim(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Returns a Set of product_ids the given user has already reviewed,
 * scoped to the provided list of product ids.
 */
export async function getReviewedProductIds(userId, productIds) {
  if (!userId || !productIds?.length) return new Set()
  const { data, error } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('user_id', userId)
    .in('product_id', productIds)
  if (error) throw error
  return new Set((data || []).map((r) => r.product_id))
}
