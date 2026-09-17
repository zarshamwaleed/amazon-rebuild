import { supabase } from './supabase'

/**
 * Rule-based recommendations:
 * 1. Same brand (top rated)
 * 2. Similar price (±30%), excluding current + already-picked
 * 3. Same category (top rated)
 * 4. Popular products (highest rating overall)
 *
 * Returns up to `limit` products, no duplicates.
 */
export async function getRecommendations(product, limit = 8) {
  if (!product) return []

  const picked = []
  const pickedIds = new Set([product.id])

  const addUnique = (rows) => {
    for (const p of rows || []) {
      if (pickedIds.has(p.id)) continue
      picked.push(p)
      pickedIds.add(p.id)
      if (picked.length >= limit) return
    }
  }

  try {
    // 1. Same brand
    if (picked.length < limit && product.brand) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('brand', product.brand)
        .neq('id', product.id)
        .order('rating', { ascending: false })
        .limit(limit)
      addUnique(data)
    }

    // 2. Similar price (±30%)
    if (picked.length < limit) {
      const price = Number(product.price)
      const min = +(price * 0.7).toFixed(2)
      const max = +(price * 1.3).toFixed(2)
      const { data } = await supabase
        .from('products')
        .select('*')
        .gte('price', min)
        .lte('price', max)
        .neq('id', product.id)
        .order('rating', { ascending: false })
        .limit(limit)
      addUnique(data)
    }

    // 3. Same category
    if (picked.length < limit && product.category_id) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .order('rating', { ascending: false })
        .limit(limit)
      addUnique(data)
    }

    // 4. Popular (highest rating fallback)
    if (picked.length < limit) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .neq('id', product.id)
        .order('rating', { ascending: false })
        .limit(limit * 2)
      addUnique(data)
    }
  } catch (err) {
    console.warn('[recommendations]', err)
  }

  return picked.slice(0, limit)
}
