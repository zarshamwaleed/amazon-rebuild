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

/**
 * Fetch aggregate seller metrics for the dashboard.
 * Products, orders, and units are counted where products.seller_id = this seller.
 */
export async function getSellerStats(userId) {
  // 1. Get this seller's products
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, title, price, stock, image_url')
    .eq('seller_id', userId)
  if (pErr) throw pErr

  const productIds = (products || []).map((p) => p.id)
  const unitsInStock = (products || []).reduce((s, p) => s + (p.stock || 0), 0)

  if (productIds.length === 0) {
    return {
      sales: 0,
      orders: 0,
      units: 0,
      sessions: 0,
      conversionRate: 0,
      inventoryCount: 0,
      unitsInStock: 0,
      lowStock: [],
      recentOrders: [],
      recentSales: [],
    }
  }

  // 2. Get order_items for those products
  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, product_title, price, quantity')
    .in('product_id', productIds)
  if (iErr) throw iErr

  const orderIds = [...new Set((items || []).map((i) => i.order_id))]
  const units = (items || []).reduce((s, i) => s + (i.quantity || 0), 0)
  const sales = (items || []).reduce(
    (s, i) => s + Number(i.price || 0) * (i.quantity || 0),
    0
  )

  // 3. Fetch the actual orders
  let recentOrders = []
  let allOrders = []
  if (orderIds.length) {
    const { data: orders, error: oErr } = await supabase
      .from('orders')
      .select('id, created_at, order_status, total')
      .in('id', orderIds)
      .order('created_at', { ascending: false })
    if (oErr) throw oErr
    allOrders = orders || []
    recentOrders = allOrders.slice(0, 5)
  }

  // 4. Low stock products
  const lowStock = (products || []).filter((p) => (p.stock || 0) < 5)

  // 5. Recent sales — last 5 order_items joined with their titles
  const recentSales = (items || [])
    .slice(-5)
    .reverse()
    .map((i) => ({
      id: i.id,
      title: i.product_title,
      price: Number(i.price || 0),
      quantity: i.quantity,
    }))

  // Sessions is simulated (no tracking yet)
  const sessions = 0
  const conversionRate = sessions > 0 ? (orderIds.length / sessions) * 100 : 0

  return {
    sales: +sales.toFixed(2),
    orders: orderIds.length,
    units,
    sessions,
    conversionRate,
    inventoryCount: productIds.length,
    unitsInStock,
    lowStock,
    recentOrders,
    recentSales,
  }
}