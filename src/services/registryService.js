import { supabase } from './supabase'

/**
 * Fetch all registries owned by the signed-in user.
 */
export async function getMyRegistries(userId) {
  const { data, error } = await supabase
    .from('registries')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Fetch a single registry by ID.
 * Returns the registry row if the caller owns it OR it's public/shared.
 */
export async function getRegistryById(registryId) {
  const { data, error } = await supabase
    .from('registries')
    .select('*')
    .eq('id', registryId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Create a new registry.
 */
export async function createRegistry(userId, payload) {
  const slug =
    (payload.name || 'registry')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 8)

  const { data, error } = await supabase
    .from('registries')
    .insert({
      user_id: userId,
      type: payload.type,
      name: payload.name,
      slug,
      description: payload.description || null,
      event_date: payload.event_date || null,
      expected_date: payload.expected_date || null,
      owner_first_name: payload.owner_first_name || null,
      owner_last_name: payload.owner_last_name || null,
      co_registrant_name: payload.co_registrant_name || null,
      city: payload.city || null,
      state: payload.state || null,
      privacy: payload.privacy || 'public',
      allow_name_search: payload.allow_name_search !== false,
      show_location: payload.show_location !== false,
      gift_address: payload.gift_address || null,
      status: 'active',
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Update an existing registry.
 */
export async function updateRegistry(registryId, updates) {
  const { data, error } = await supabase
    .from('registries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', registryId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Delete (archive) a registry.
 */
export async function deleteRegistry(registryId) {
  const { error } = await supabase
    .from('registries')
    .delete()
    .eq('id', registryId)
  if (error) throw error
}

/**
 * Search public registries by owner name.
 */
export async function searchRegistries({ firstName, lastName, city, state }) {
  let query = supabase
    .from('registries')
    .select('*')
    .in('privacy', ['public', 'shared'])
    .eq('allow_name_search', true)

  if (firstName) query = query.ilike('owner_first_name', `%${firstName}%`)
  if (lastName) query = query.ilike('owner_last_name', `%${lastName}%`)
  if (city) query = query.ilike('city', `%${city}%`)
  if (state) query = query.ilike('state', `%${state}%`)

  const { data, error } = await query.limit(30)
  if (error) throw error
  return data || []
}

/**
 * Registry type metadata — used by the landing page and create wizard.
 */
export const REGISTRY_TYPES = [
  {
    id: 'baby',
    name: 'Baby Registry',
    tagline: 'Everything you need for your new arrival.',
    emoji: '👶',
    color: 'from-pink-500 to-rose-500',
    fields: ['expected_date'],
  },
  {
    id: 'wedding',
    name: 'Wedding Registry',
    tagline: 'Build your registry for the big day.',
    emoji: '💍',
    color: 'from-purple-500 to-fuchsia-500',
    fields: ['event_date', 'co_registrant_name'],
  },
  {
    id: 'birthday',
    name: 'Birthday Registry',
    tagline: 'A wishlist for your birthday.',
    emoji: '🎂',
    color: 'from-amber-500 to-orange-500',
    fields: ['event_date'],
  },
  {
    id: 'custom',
    name: 'Other Registry',
    tagline: 'Create a list for any occasion.',
    emoji: '🎁',
    color: 'from-emerald-500 to-teal-500',
    fields: ['event_date'],
  },
]

export function getRegistryTypeMeta(typeId) {
  return REGISTRY_TYPES.find((t) => t.id === typeId) || REGISTRY_TYPES[3]
}

/**
 * Fetch all items in a registry, joined with product data.
 */
export async function getRegistryItems(registryId) {
  const { data, error } = await supabase
    .from('registry_items')
    .select('*, products(*)')
    .eq('registry_id', registryId)
    .neq('status', 'removed')
    .order('added_at', { ascending: true })
  if (error) throw error
  return (data || []).map((row) => ({ ...row, product: row.products }))
}

/**
 * Add a product to a registry. If it already exists, increment the requested qty.
 */
export async function addRegistryItem({
  registryId,
  productId,
  quantity = 1,
  priority = 'normal',
  publicNote = null,
  privateNote = null,
}) {
  // Check if item already exists
  const { data: existing, error: eErr } = await supabase
    .from('registry_items')
    .select('id, quantity_requested, status')
    .eq('registry_id', registryId)
    .eq('product_id', productId)
    .maybeSingle()
  if (eErr) throw eErr

  if (existing) {
    const { data, error } = await supabase
      .from('registry_items')
      .update({
        quantity_requested: existing.quantity_requested + Number(quantity),
        status: 'available',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('registry_items')
    .insert({
      registry_id: registryId,
      product_id: productId,
      quantity_requested: Number(quantity) || 1,
      quantity_purchased: 0,
      priority,
      public_note: publicNote,
      private_note: privateNote,
      status: 'available',
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Update a registry item.
 */
export async function updateRegistryItem(itemId, updates) {
  const clean = { ...updates, updated_at: new Date().toISOString() }
  const { data, error } = await supabase
    .from('registry_items')
    .update(clean)
    .eq('id', itemId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Remove a registry item.
 */
export async function removeRegistryItem(itemId) {
  const { error } = await supabase
    .from('registry_items')
    .delete()
    .eq('id', itemId)
  if (error) throw error
}

/**
 * Compute progress summary for a registry.
 * Uses purchased_quantity / requested_quantity for progress.
 */
export function computeRegistryProgress(items) {
  let requested = 0
  let purchased = 0
  for (const it of items || []) {
    requested += it.quantity_requested || 0
    purchased += it.quantity_purchased || 0
  }
  const remaining = Math.max(0, requested - purchased)
  const percent = requested > 0 ? (purchased / requested) * 100 : 0
  return {
    totalItems: items?.length || 0,
    requested,
    purchased,
    remaining,
    percent: +percent.toFixed(1),
  }
}

/**
 * Check if a product is already in one of the user's registries.
 */
export async function findProductInUserRegistries(userId, productId) {
  if (!userId || !productId) return []
  const { data, error } = await supabase
    .from('registry_items')
    .select('id, registry_id, quantity_requested, registries(id, name, type, privacy)')
    .eq('product_id', productId)
    .neq('status', 'removed')
  if (error) return []
  // Filter to registries owned by user
  return (data || []).filter((row) => row.registries)
}