import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'The Supabase client is created but cannot connect. ' +
    'Add real values to .env once Module 2 sets up the project.'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
