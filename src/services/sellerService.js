import { supabase } from './supabase'

export async function getSellerProfile(userId) {
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createSellerProfile(userId, payload) {
  const { data, error } = await supabase
    .from('seller_profiles')
    .upsert(
      { user_id: userId, ...payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateSellerProfile(userId, updates) {
  const { data, error } = await supabase
    .from('seller_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}