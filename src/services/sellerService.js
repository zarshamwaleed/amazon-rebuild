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

/**
 * Fetch all products belonging to this seller.
 */
export async function getSellerProducts(userId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Fetch one product (must belong to the seller).
 */
export async function getSellerProduct(userId, productId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('seller_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

function slugify(title) {
  return (
    (title || 'product')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Date.now().toString(36)
  )
}

/**
 * Create a new product owned by this seller.
 * status: 'published' | 'draft'
 */
export async function createSellerProduct(userId, payload, status = 'published') {
  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: userId,
      title: payload.title || 'Untitled product',
      slug: slugify(payload.title),
      description: payload.description || '',
      price: Number(payload.price) || 0,
      old_price: payload.old_price ? Number(payload.old_price) : null,
      image_url: payload.image_url || null,
      rating: 0,
      review_count: 0,
      stock: Number(payload.stock) || 0,
      brand: payload.brand || null,
      category_id: payload.category_id || null,
      sku: payload.sku || null,
      manufacturer: payload.manufacturer || null,
      product_type: payload.product_type || null,
      bullet_points: payload.bullet_points || [],
      keywords: payload.keywords || null,
      additional_images: payload.additional_images || [],
      variations: payload.variations || [],
      msrp: payload.msrp ? Number(payload.msrp) : null,
      fulfillment_method: payload.fulfillment_method || 'FBM',
      low_stock_threshold: Number(payload.low_stock_threshold) || 5,
      status,
      is_active: status === 'published',
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Update an existing seller product. Preserves status unless passed in.
 */
export async function updateSellerProduct(userId, productId, updates) {
  const clean = { ...updates }

  // Coerce numeric fields
  if (clean.price !== undefined) clean.price = Number(clean.price) || 0
  if (clean.old_price !== undefined)
    clean.old_price = clean.old_price ? Number(clean.old_price) : null
  if (clean.msrp !== undefined) clean.msrp = clean.msrp ? Number(clean.msrp) : null
  if (clean.stock !== undefined) clean.stock = Number(clean.stock) || 0
  if (clean.low_stock_threshold !== undefined)
    clean.low_stock_threshold = Number(clean.low_stock_threshold) || 5

  // Never overwrite slug with title change
  delete clean.slug
  delete clean.seller_id

  const { data, error } = await supabase
    .from('products')
    .update(clean)
    .eq('id', productId)
    .eq('seller_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Publish an existing draft.
 */
export async function publishProduct(userId, productId) {
  return updateSellerProduct(userId, productId, {
    status: 'published',
    is_active: true,
  })
}

/**
 * Delete a product (only if owned by seller).
 */
export async function deleteSellerProduct(userId, productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Duplicate a product as a new draft.
 */
export async function duplicateSellerProduct(userId, product) {
  return createSellerProduct(userId, {
    title: product.title + ' (Copy)',
    description: product.description,
    price: product.price,
    old_price: product.old_price,
    image_url: product.image_url,
    stock: product.stock,
    brand: product.brand,
    category_id: product.category_id,
  })
}

/**
 * Seller inventory — products owned by the seller, enriched with computed
 * reserved / inbound metrics.
 */
export async function getSellerInventory(userId) {
  // Products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', userId)
    .order('title')
  if (error) throw error

  const productIds = (products || []).map((p) => p.id)
  const reservedMap = {}

  // Reserved = quantities in orders whose status is not delivered/cancelled
  if (productIds.length) {
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity, order_id, orders(order_status)')
      .in('product_id', productIds)

    for (const it of items || []) {
      const status = it.orders?.order_status || ''
      if (['delivered', 'cancelled'].includes(status)) continue
      reservedMap[it.product_id] = (reservedMap[it.product_id] || 0) + (it.quantity || 0)
    }
  }

  return (products || []).map((p) => ({
    ...p,
    reserved: reservedMap[p.id] || 0,
    inbound: 0, // simulated — no shipment tracking yet
    available: Math.max(0, (p.stock || 0)),
  }))
}

/**
 * Update quantity (stock) and/or price for a seller's product.
 */
export async function updateInventory(userId, productId, updates) {
  const clean = {}
  if (updates.stock !== undefined) clean.stock = Number(updates.stock) || 0
  if (updates.price !== undefined) clean.price = Number(updates.price) || 0

  const { data, error } = await supabase
    .from('products')
    .update(clean)
    .eq('id', productId)
    .eq('seller_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Fetch every order containing this seller's products.
 * Returns an array of { order, seller_items } where seller_items are only
 * the line items belonging to this seller.
 */
export async function getSellerOrders(userId) {
  // 1. Products owned by seller
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id')
    .eq('seller_id', userId)
  if (pErr) throw pErr

  const productIds = (products || []).map((p) => p.id)
  if (productIds.length === 0) return []

  // 2. Order items for those products
  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, product_title, product_image, price, quantity')
    .in('product_id', productIds)
  if (iErr) throw iErr

  const orderIds = [...new Set((items || []).map((i) => i.order_id))]
  if (orderIds.length === 0) return []

  // 3. Parent orders
  const { data: orders, error: oErr } = await supabase
    .from('orders')
    .select('*, addresses(*)')
    .in('id', orderIds)
    .order('created_at', { ascending: false })
  if (oErr) throw oErr

  // 4. Group items by order
  const itemsByOrder = {}
  for (const it of items || []) {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = []
    itemsByOrder[it.order_id].push(it)
  }

  return (orders || []).map((order) => ({
    order,
    seller_items: itemsByOrder[order.id] || [],
  }))
}

/**
 * Fetch a single order for a seller (validates ownership of at least one item).
 */
export async function getSellerOrder(userId, orderId) {
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('seller_id', userId)
  const productIds = (products || []).map((p) => p.id)
  if (productIds.length === 0) return null

  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, product_title, product_image, price, quantity')
    .eq('order_id', orderId)
    .in('product_id', productIds)
  if (iErr) throw iErr
  if (!items || items.length === 0) return null

  const { data: order, error: oErr } = await supabase
    .from('orders')
    .select('*, addresses(*)')
    .eq('id', orderId)
    .maybeSingle()
  if (oErr) throw oErr

  return { order, seller_items: items }
}

/**
 * Update the order_status of a seller's order.
 * Note: order_status is shared with the customer's view of the order.
 */
export async function updateOrderStatus(orderId, nextStatus) {
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: nextStatus })
    .eq('id', orderId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Fetch orders grouped by fulfillment method (FBA / FBM) for this seller.
 * Returns { FBA: [...], FBM: [...] } where each entry is { order, seller_items }.
 */
export async function getSellerFulfillmentQueue(userId) {
  // Products owned by seller with their fulfillment method
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, fulfillment_method')
    .eq('seller_id', userId)
  if (pErr) throw pErr

  const methodByProduct = {}
  for (const p of products || []) {
    methodByProduct[p.id] = p.fulfillment_method || 'FBM'
  }

  const productIds = Object.keys(methodByProduct)
  if (productIds.length === 0) return { FBA: [], FBM: [] }

  // Order items for these products
  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, product_title, product_image, price, quantity')
    .in('product_id', productIds)
  if (iErr) throw iErr

  const orderIds = [...new Set((items || []).map((i) => i.order_id))]
  if (orderIds.length === 0) return { FBA: [], FBM: [] }

  // Parent orders
  const { data: orders, error: oErr } = await supabase
    .from('orders')
    .select('*, addresses(*)')
    .in('id', orderIds)
    .order('created_at', { ascending: false })
  if (oErr) throw oErr

  // Group items by order
  const itemsByOrder = {}
  for (const it of items || []) {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = []
    itemsByOrder[it.order_id].push(it)
  }

  const buckets = { FBA: [], FBM: [] }
  for (const order of orders || []) {
    const sellerItems = itemsByOrder[order.id] || []
    if (sellerItems.length === 0) continue
    // Determine fulfillment by the first item; if mixed, treat as FBM
    const methods = new Set(sellerItems.map((i) => methodByProduct[i.product_id] || 'FBM'))
    const method = methods.size === 1 ? [...methods][0] : 'FBM'
    buckets[method].push({ order, seller_items: sellerItems })
  }

  return buckets
}

/**
 * Pricing view: seller products with min/max bounds + any active automation rule.
 */
export async function getSellerPricing(userId) {
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, title, sku, price, min_price, max_price, featured_offer, stock, image_url')
    .eq('seller_id', userId)
    .order('title')
  if (pErr) throw pErr

  const { data: rules, error: rErr } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('seller_id', userId)
  if (rErr) throw rErr

  const ruleByProduct = {}
  for (const r of rules || []) ruleByProduct[r.product_id] = r

  return (products || []).map((p) => ({
    ...p,
    rule: ruleByProduct[p.id] || null,
  }))
}

/**
 * Update pricing bounds + featured flag for a product.
 */
export async function updateProductPricing(userId, productId, updates) {
  const clean = {}
  if (updates.price !== undefined) clean.price = Number(updates.price) || 0
  if (updates.min_price !== undefined)
    clean.min_price = updates.min_price === '' ? null : Number(updates.min_price)
  if (updates.max_price !== undefined)
    clean.max_price = updates.max_price === '' ? null : Number(updates.max_price)
  if (updates.featured_offer !== undefined) clean.featured_offer = updates.featured_offer

  const { data, error } = await supabase
    .from('products')
    .update(clean)
    .eq('id', productId)
    .eq('seller_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Create or update an automation rule for a product.
 */
export async function upsertPricingRule(userId, rule) {
  const { data, error } = await supabase
    .from('pricing_rules')
    .upsert(
      {
        seller_id: userId,
        product_id: rule.product_id,
        rule_type: rule.rule_type || 'undercut',
        undercut_by: Number(rule.undercut_by) || 1,
        min_price: rule.min_price === '' ? null : Number(rule.min_price),
        max_price: rule.max_price === '' ? null : Number(rule.max_price),
        status: rule.status || 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'seller_id,product_id' }
    )
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Deactivate a rule.
 */
export async function deactivatePricingRule(userId, ruleId) {
  const { error } = await supabase
    .from('pricing_rules')
    .update({ status: 'inactive', updated_at: new Date().toISOString() })
    .eq('id', ruleId)
    .eq('seller_id', userId)
  if (error) throw error
}