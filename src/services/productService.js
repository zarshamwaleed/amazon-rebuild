import { supabase } from './supabase'

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getFeaturedProducts(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('rating', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getDeals(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .not('old_price', 'is', null)
    .order('rating', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getProductsByCategory(categoryId, limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .limit(limit)
  if (error) throw error
  return data
}

/**
 * Paginated + filtered + sorted product query.
 *
 * @param {object} opts
 * @param {string} [opts.categoryId]  - filter by category UUID
 * @param {number} [opts.minPrice]    - minimum price
 * @param {number} [opts.maxPrice]    - maximum price
 * @param {string} [opts.sort]        - 'newest' | 'price_asc' | 'price_desc' | 'rating'
 * @param {number} [opts.page]        - 1-based page number
 * @param {number} [opts.pageSize]    - items per page
 */
export async function queryProducts({
  categoryId,
  minPrice,
  maxPrice,
  sort = 'newest',
  page = 1,
  pageSize = 12,
} = {}) {
  let query = supabase.from('products').select('*', { count: 'exact' })

  if (categoryId) query = query.eq('category_id', categoryId)
  if (typeof minPrice === 'number') query = query.gte('price', minPrice)
  if (typeof maxPrice === 'number') query = query.lte('price', maxPrice)

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}
