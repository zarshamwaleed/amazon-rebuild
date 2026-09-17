import { supabase } from './supabase'

export async function getUserWishlist(userId) {
  const { data, error } = await supabase
    .from('wishlists')
    .select('id, product_id, created_at, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    product: row.products,
    created_at: row.created_at,
  }))
}

export async function addToWishlistDB(userId, productId) {
  const { error } = await supabase
    .from('wishlists')
    .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' })
  if (error) throw error
}

export async function removeFromWishlistDB(userId, productId) {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw error
}
