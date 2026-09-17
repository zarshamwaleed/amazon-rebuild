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

/**
 * Search products by keyword across title, brand, description.
 * Optional category filter (slug).
 * Supports sort + pagination.
 */
export async function searchProducts({
  q,
  categorySlug,
  minPrice,
  maxPrice,
  sort = 'newest',
  page = 1,
  pageSize = 12,
} = {}) {
  let query = supabase.from('products').select('*', { count: 'exact' })

  const term = (q || '').trim()
  if (term) {
    const pattern = '%' + term.replace(/[%_]/g, '') + '%'
    query = query.or(
      'title.ilike.' + pattern + ',brand.ilike.' + pattern + ',description.ilike.' + pattern
    )
  }

  if (categorySlug) {
    // We resolve the category id first to keep the query simple
    const { data: cat, error: catErr } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle()
    if (catErr) throw catErr
    if (cat) query = query.eq('category_id', cat.id)
    else {
      // Unknown category slug → no results
      return { data: [], count: 0 }
    }
  }

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
