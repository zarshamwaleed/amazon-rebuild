import { supabase } from './supabase'

export async function getUserAddresses(userId) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createAddress(userId, address) {
  const { data, error } = await supabase
    .from('addresses')
    .insert({ ...address, user_id: userId })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}
