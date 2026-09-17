import { supabase } from './supabase'

export async function getCartItems(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('id, quantity, product_id, created_at, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    quantity: row.quantity,
    product: row.products,
  }))
}

export async function upsertCartItem(userId, productId, quantity) {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, product_id: productId, quantity },
      { onConflict: 'user_id,product_id' }
    )
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateCartItemQuantity(userId, productId, quantity) {
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw error
}

export async function removeCartItem(userId, productId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw error
}

export async function clearCartDB(userId) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
  if (error) throw error
}
