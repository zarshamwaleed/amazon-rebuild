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
