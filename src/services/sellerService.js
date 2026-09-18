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

/**
 * Fetch all coupons created by this seller, grouped by lifecycle state.
 * Returns { active: [...], scheduled: [...], expired: [...] }
 */
export async function getSellerCoupons(userId) {
  const { data, error } = await supabase
    .from('coupons')
    .select(
      '*, coupon_products(product_id, products(id, title, price, image_url, sku))'
    )
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error

  const now = new Date()
  const buckets = { active: [], scheduled: [], expired: [] }

  for (const c of data || []) {
    const start = c.start_date ? new Date(c.start_date) : null
    const end = c.end_date ? new Date(c.end_date) : null
    const enriched = {
      ...c,
      products: (c.coupon_products || []).map((cp) => cp.products).filter(Boolean),
    }
    if (end && end < now) buckets.expired.push(enriched)
    else if (start && start > now) buckets.scheduled.push(enriched)
    else buckets.active.push(enriched)
  }

  return buckets
}

/**
 * Create a seller coupon linked to one product.
 */
export async function createSellerCoupon(userId, payload) {
  const { title, description, discount_type, discount_value, budget, start_date, end_date, product_id } = payload

  const { data: coupon, error: cErr } = await supabase
    .from('coupons')
    .insert({
      seller_id: userId,
      title,
      description: description || '',
      discount_type,
      discount_value: Number(discount_value),
      minimum_purchase: 0,
      budget: budget ? Number(budget) : null,
      start_date: start_date || new Date().toISOString(),
      end_date,
      status: 'active',
    })
    .select()
    .maybeSingle()
  if (cErr) throw cErr

  const { error: cpErr } = await supabase
    .from('coupon_products')
    .insert({ coupon_id: coupon.id, product_id })
  if (cpErr) throw cpErr

  return coupon
}

/**
 * Delete a seller coupon (cascade removes coupon_products + user_coupons).
 */
export async function deleteSellerCoupon(userId, couponId) {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', couponId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Toggle a coupon's status between active and inactive.
 */
export async function toggleCouponStatus(userId, couponId, status) {
  const { error } = await supabase
    .from('coupons')
    .update({ status })
    .eq('id', couponId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Fetch deals created by this seller, grouped by lifecycle.
 * Returns { active: [...], upcoming: [...], completed: [...] }
 */
export async function getSellerDeals(userId) {
  const { data, error } = await supabase
    .from('deals')
    .select('*, products(id, title, price, image_url, sku)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error

  const now = new Date()
  const buckets = { active: [], upcoming: [], completed: [] }

  for (const d of data || []) {
    const start = d.start_date ? new Date(d.start_date) : null
    const end = d.end_date ? new Date(d.end_date) : null
    const enriched = { ...d, product: d.products }
    if (d.status === 'cancelled') continue
    if (end && end < now) buckets.completed.push(enriched)
    else if (start && start > now) buckets.upcoming.push(enriched)
    else buckets.active.push(enriched)
  }

  return buckets
}

/**
 * Create a seller deal. Sets the product's old_price to the original price
 * and price to the deal price while the deal is active.
 */
export async function createSellerDeal(userId, payload) {
  const { product_id, deal_price, start_date, end_date, quantity_limit } = payload

  // Fetch original price
  const { data: product, error: pErr } = await supabase
    .from('products')
    .select('id, price')
    .eq('id', product_id)
    .eq('seller_id', userId)
    .maybeSingle()
  if (pErr) throw pErr
  if (!product) throw new Error('Product not found or not owned by you')

  const originalPrice = Number(product.price)

  const { data, error } = await supabase
    .from('deals')
    .insert({
      seller_id: userId,
      product_id,
      deal_price: Number(deal_price),
      original_price: originalPrice,
      start_date,
      end_date,
      quantity_limit: Number(quantity_limit) || 100,
      status: new Date(start_date) <= new Date() ? 'active' : 'upcoming',
    })
    .select()
    .maybeSingle()
  if (error) throw error

  // If the deal is already active, apply the deal price to the product
  if (data.status === 'active') {
    await supabase
      .from('products')
      .update({ price: Number(deal_price), old_price: originalPrice })
      .eq('id', product_id)
      .eq('seller_id', userId)
  }

  return data
}

/**
 * Cancel a deal.
 */
export async function cancelSellerDeal(userId, dealId) {
  const { error } = await supabase
    .from('deals')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', dealId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Fetch advertising campaigns for this seller.
 */
export async function getSellerCampaigns(userId) {
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*, products(id, title, price, image_url)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data || []).map((c) => ({
    ...c,
    product: c.products,
    metrics: simulateCampaignMetrics(c),
  }))
}

/**
 * Create a new ad campaign.
 */
export async function createCampaign(userId, payload) {
  const { data, error } = await supabase
    .from('ad_campaigns')
    .insert({
      seller_id: userId,
      product_id: payload.product_id,
      name: payload.name,
      campaign_type: payload.campaign_type,
      daily_budget: Number(payload.daily_budget) || 20,
      bid: Number(payload.bid) || 0.75,
      targeting: payload.targeting || 'auto',
      status: 'active',
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Toggle a campaign between active and paused.
 */
export async function toggleCampaignStatus(userId, campaignId, status) {
  const { error } = await supabase
    .from('ad_campaigns')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', campaignId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Delete a campaign.
 */
export async function deleteCampaign(userId, campaignId) {
  const { error } = await supabase
    .from('ad_campaigns')
    .delete()
    .eq('id', campaignId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Deterministically simulate ad metrics.
 * The seed comes from the campaign id + created_at so numbers stay
 * consistent across reloads but vary meaningfully between campaigns.
 */
function simulateCampaignMetrics(campaign) {
  // Simple hash from id + created_at
  const seedStr = (campaign.id || '') + (campaign.created_at || '')
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0
  }
  const rand = (n) => (hash % n) / n

  const daysSince = Math.max(
    1,
    Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / 86400000)
  )
  const daysRunning = Math.min(daysSince, 30)

  // Impressions scale with budget and days
  const budgetScale = Number(campaign.daily_budget) || 20
  const impressions = Math.floor(budgetScale * 200 * daysRunning * (0.7 + rand(30) / 100))
  const ctr = 0.02 + rand(40) / 1000 // 2% – 6%
  const clicks = Math.floor(impressions * ctr)
  const spend = +(clicks * (Number(campaign.bid) || 0.75)).toFixed(2)
  const conversionRate = 0.03 + rand(50) / 1000 // 3% – 8%
  const orders = Math.max(0, Math.floor(clicks * conversionRate))

  // Avg product price assumption
  const productPrice = Number(campaign.product?.price) || 49.99
  const sales = +(orders * productPrice).toFixed(2)
  const roas = spend > 0 ? +(sales / spend).toFixed(2) : 0

  return { impressions, clicks, spend, sales, roas, orders }
}

/**
 * Fetch this seller's brand store (or null if none exists).
 */
export async function getSellerStore(userId) {
  const { data, error } = await supabase
    .from('brand_stores')
    .select('*')
    .eq('seller_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Create or update the seller's store. Slug is derived from store_name on
 * first save and never changes afterwards (unless explicitly passed).
 */
export async function upsertSellerStore(userId, payload) {
  const slug = payload.slug || slugifyStoreName(payload.store_name)

  const { data, error } = await supabase
    .from('brand_stores')
    .upsert(
      {
        seller_id: userId,
        slug,
        store_name: payload.store_name,
        tagline: payload.tagline || null,
        brand_description: payload.brand_description || null,
        brand_story: payload.brand_story || null,
        logo_url: payload.logo_url || null,
        hero_image_url: payload.hero_image_url || null,
        featured_product_ids: payload.featured_product_ids || [],
        grid_product_ids: payload.grid_product_ids || [],
        status: payload.status || 'draft',
        updated_at: new Date().toISOString(),
        published_at:
          payload.status === 'published'
            ? payload.published_at || new Date().toISOString()
            : payload.published_at || null,
      },
      { onConflict: 'seller_id' }
    )
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Fetch a public store by slug. Returns store + resolved products.
 */
export async function getPublicStore(slug) {
  const { data: store, error } = await supabase
    .from('brand_stores')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  if (!store) return null

  // Fetch all seller products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', store.seller_id)

  const byId = {}
  for (const p of products || []) byId[p.id] = p

  const featured = (store.featured_product_ids || [])
    .map((id) => byId[id])
    .filter(Boolean)
  const grid = (store.grid_product_ids || []).map((id) => byId[id]).filter(Boolean)
  // Fallback grid = all products
  const gridFinal = grid.length > 0 ? grid : products || []

  return { store, featured, grid: gridFinal }
}

/**
 * Slugify store name — lowercase, kebab-case.
 */
export function slugifyStoreName(name) {
  return (
    (name || 'store')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 6)
  )
}

/**
 * Aggregate a full business report for the seller across a date range.
 *
 * @param {string} userId
 * @param {Date|string} from
 * @param {Date|string} to
 */
export async function getSellerReport(userId, from, to) {
  const fromIso = new Date(from).toISOString()
  const toIso = new Date(to).toISOString()

  // 1. Seller's products
  const { data: products, error: pErr } = await supabase
    .from('products')
        .select('*')
    .eq('seller_id', userId)
  if (pErr) throw pErr

  const productIds = (products || []).map((p) => p.id)
  const productById = Object.fromEntries((products || []).map((p) => [p.id, p]))

  if (productIds.length === 0) {
    return emptyReport(from, to)
  }

  // 2. Order items in range for these products
  const { data: items, error: iErr } = await supabase
    .from('order_items')
        .select('*')
    .in('product_id', productIds)
  if (iErr) throw iErr

  // Fetch parent orders in range (to get created_at and status)
  const orderIds = [...new Set((items || []).map((i) => i.order_id))]
  let orders = []
  if (orderIds.length) {
    const { data: oData, error: oErr } = await supabase
      .from('orders')
      .select('id, created_at, order_status, total, payment_status')
      .in('id', orderIds)
      .gte('created_at', fromIso)
      .lte('created_at', toIso)
    if (oErr) throw oErr
    orders = oData || []
  }

  const ordersById = Object.fromEntries(orders.map((o) => [o.id, o]))

  // Filter items whose parent order is in range
  const inRangeItems = (items || []).filter((i) => ordersById[i.order_id])

  // 3. Compute KPIs
  let sales = 0
  let units = 0
  const uniqueOrders = new Set()
  for (const it of inRangeItems) {
    sales += Number(it.price) * Number(it.quantity)
    units += Number(it.quantity)
    uniqueOrders.add(it.order_id)
  }

  const orderCount = uniqueOrders.size
  // Sessions is simulated — a multiple of order count
  const sessions = orderCount > 0 ? orderCount * 42 + 17 : 0
  const conversionRate = sessions > 0 ? (orderCount / sessions) * 100 : 0

  // 4. Sales + orders over time (by day)
  const daysMap = buildDayMap(from, to)
  for (const it of inRangeItems) {
    const o = ordersById[it.order_id]
    if (!o) continue
    const day = dayKey(o.created_at)
    if (daysMap[day]) {
      daysMap[day].sales += Number(it.price) * Number(it.quantity)
      daysMap[day].units += Number(it.quantity)
    }
  }
  for (const o of orders) {
    const day = dayKey(o.created_at)
    if (daysMap[day]) daysMap[day].orders += 1
    if (daysMap[day]) daysMap[day].sessions += 43
  }

  const series = Object.values(daysMap).map((d) => ({
    label: d.shortLabel,
    fullDate: d.date,
    sales: +d.sales.toFixed(2),
    orders: d.orders,
    units: d.units,
    sessions: d.sessions,
  }))

  // 5. Traffic summary
  const totalSessions = series.reduce((s, d) => s + d.sessions, 0)

  // 6. Inventory snapshot
  const lowStock = (products || []).filter(
    (p) => p.stock > 0 && p.stock <= (p.low_stock_threshold || 5)
  )
  const outOfStock = (products || []).filter((p) => p.stock === 0)
  const inventoryValue = (products || []).reduce(
    (s, p) => s + Number(p.price) * p.stock,
    0
  )

  // 7. Advertising summary from ad_campaigns
  const { data: campaigns } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('seller_id', userId)
  let adSpend = 0
  let adSales = 0
  let adImpressions = 0
  let adClicks = 0
  for (const c of campaigns || []) {
    const m = simulateCampaignMetrics(c)
    adImpressions += m.impressions
    adClicks += m.clicks
    adSpend += m.spend
    adSales += m.sales
  }
  const adRoas = adSpend > 0 ? +(adSales / adSpend).toFixed(2) : 0

  // 8. Payments summary
  const platformFeeRate = 0.15
  const grossSales = +sales.toFixed(2)
  const platformFees = +(grossSales * platformFeeRate).toFixed(2)
  const netProceeds = +(grossSales - platformFees).toFixed(2)

  return {
    range: { from: fromIso, to: toIso },
    kpis: {
      sales: grossSales,
      orders: orderCount,
      units,
      sessions: totalSessions,
      conversionRate: +conversionRate.toFixed(2),
      aov: orderCount > 0 ? +(grossSales / orderCount).toFixed(2) : 0,
    },
    series,
    traffic: {
      sessions: totalSessions,
      pageViews: totalSessions * 3,
      conversionRate: +conversionRate.toFixed(2),
    },
    inventory: {
      totalSkus: products.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalUnits: products.reduce((s, p) => s + (p.stock || 0), 0),
      inventoryValue: +inventoryValue.toFixed(2),
    },
    returns: {
      count: 0,
      value: 0,
    },
    advertising: {
      impressions: adImpressions,
      clicks: adClicks,
      spend: +adSpend.toFixed(2),
      sales: +adSales.toFixed(2),
      roas: adRoas,
    },
    payments: {
      gross: grossSales,
      fees: platformFees,
      net: netProceeds,
      feeRate: platformFeeRate * 100,
    },
  }
}

function dayKey(iso) {
  const d = new Date(iso)
  return d.toISOString().slice(0, 10)
}

function buildDayMap(from, to) {
  const out = {}
  const start = new Date(from)
  start.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)
  const cursor = new Date(start)
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    out[key] = {
      date: key,
      shortLabel: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: 0,
      orders: 0,
      units: 0,
      sessions: 0,
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

function emptyReport(from, to) {
  return {
    range: { from: new Date(from).toISOString(), to: new Date(to).toISOString() },
    kpis: { sales: 0, orders: 0, units: 0, sessions: 0, conversionRate: 0, aov: 0 },
    series: [],
    traffic: { sessions: 0, pageViews: 0, conversionRate: 0 },
    inventory: { totalSkus: 0, lowStock: 0, outOfStock: 0, totalUnits: 0, inventoryValue: 0 },
    returns: { count: 0, value: 0 },
    advertising: { impressions: 0, clicks: 0, spend: 0, sales: 0, roas: 0 },
    payments: { gross: 0, fees: 0, net: 0, feeRate: 15 },
  }
}

/**
 * Compute a full payments summary for the seller.
 * All financial movement is simulated — no real payouts, no real fees.
 */
export async function getSellerPayments(userId) {
  // Seller products
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, title')
    .eq('seller_id', userId)
  if (pErr) throw pErr

  const productIds = (products || []).map((p) => p.id)
  if (productIds.length === 0) {
    return emptyPayments()
  }

  // Order items
  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, product_title, price, quantity')
    .in('product_id', productIds)
  if (iErr) throw iErr

  const orderIds = [...new Set((items || []).map((i) => i.order_id))]
  if (orderIds.length === 0) {
    return emptyPayments()
  }

  // Parent orders
  const { data: orders, error: oErr } = await supabase
    .from('orders')
    .select('id, created_at, order_status, total, payment_status, payment_method')
    .in('id', orderIds)
    .order('created_at', { ascending: false })
  if (oErr) throw oErr

  const ordersById = Object.fromEntries((orders || []).map((o) => [o.id, o]))
  const itemsByOrder = {}
  for (const it of items || []) {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = []
    itemsByOrder[it.order_id].push(it)
  }

  const FEE_RATE = 0.15
  const now = Date.now()

  let gross = 0
  let fees = 0
  let refunds = 0
  const transactions = []
  let pendingPayout = 0

  for (const o of orders || []) {
    const oItems = itemsByOrder[o.id] || []
    if (oItems.length === 0) continue

    const sellerSubtotal = oItems.reduce(
      (s, i) => s + Number(i.price) * i.quantity,
      0
    )
    const lineItems = oItems.map((i) => i.product_title).join(', ')
    const cancelled = ['cancelled', 'returned'].includes(
      (o.order_status || '').toLowerCase()
    )

    if (cancelled) {
      refunds += sellerSubtotal
      transactions.push({
        id: o.id + '-refund',
        date: o.created_at,
        order: o.id,
        type: 'Refund',
        description: lineItems,
        amount: -sellerSubtotal,
        fees: 0,
        net: -sellerSubtotal,
        tone: 'red',
      })
      continue
    }

    gross += sellerSubtotal

    // Sale transaction
    transactions.push({
      id: o.id + '-sale',
      date: o.created_at,
      order: o.id,
      type: 'Sale',
      description: lineItems,
      amount: sellerSubtotal,
      fees: 0,
      net: sellerSubtotal,
      tone: 'default',
    })

    // Fee transaction
    const fee = +(sellerSubtotal * FEE_RATE).toFixed(2)
    fees += fee
    transactions.push({
      id: o.id + '-fee',
      date: o.created_at,
      order: o.id,
      type: 'Fee',
      description: 'Platform fee (15%)',
      amount: 0,
      fees: fee,
      net: -fee,
      tone: 'default',
    })

    // Pending payout if order is recent (< 14 days old) and paid
    const ageDays = (now - new Date(o.created_at).getTime()) / 86400000
    if (ageDays < 14 && o.payment_status === 'paid') {
      pendingPayout += sellerSubtotal - fee
    }
  }

  const netProceeds = +(gross - fees - refunds).toFixed(2)
  const availableBalance = netProceeds > 0 ? +(netProceeds - pendingPayout).toFixed(2) : 0
  const nextPayout = +pendingPayout.toFixed(2)

  transactions.sort((a, b) => new Date(b.date) - new Date(a.date))

  return {
    availableBalance: Math.max(0, availableBalance),
    nextPayout,
    gross: +gross.toFixed(2),
    fees: +fees.toFixed(2),
    refunds: +refunds.toFixed(2),
    netProceeds,
    feeRate: FEE_RATE * 100,
    transactions,
  }
}

function emptyPayments() {
  return {
    availableBalance: 0,
    nextPayout: 0,
    gross: 0,
    fees: 0,
    refunds: 0,
    netProceeds: 0,
    feeRate: 15,
    transactions: [],
  }
}

/**
 * Compute the seller's account health metrics from real data.
 * Returns sections with statuses + alerts + a 30-day score trend.
 */
export async function getSellerHealth(userId) {
  // Seller products
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, title, stock, image_url, description, is_active')
    .eq('seller_id', userId)
  if (pErr) throw pErr

  const productIds = (products || []).map((p) => p.id)

  // Fetch order items + parent orders
  let orders = []
  if (productIds.length) {
    const { data: items } = await supabase
      .from('order_items')
      .select('order_id')
      .in('product_id', productIds)
    const orderIds = [...new Set((items || []).map((i) => i.order_id))]
    if (orderIds.length) {
      const { data: o } = await supabase
        .from('orders')
        .select('id, created_at, order_status')
        .in('id', orderIds)
      orders = o || []
    }
  }

  const totalOrders = orders.length
  const cancelledOrders = orders.filter(
    (o) => (o.order_status || '').toLowerCase() === 'cancelled'
  ).length
  const returnedOrders = orders.filter(
    (o) => (o.order_status || '').toLowerCase() === 'returned'
  ).length
  const pendingShipments = orders.filter((o) =>
    ['order_placed', 'processing', 'packed'].includes(
      (o.order_status || '').toLowerCase()
    )
  )

  // Rates
  const cancelRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0
  const defectRate =
    totalOrders > 0 ? ((cancelledOrders + returnedOrders) / totalOrders) * 100 : 0
  const lateShipRate =
    totalOrders > 0 ? (Math.min(pendingShipments.length, 2) / totalOrders) * 100 : 0

  // Thresholds (Amazon-like, but simplified)
  const THRESHOLDS = {
    defect: 1.0, // under 1% = healthy
    late: 4.0, // under 4% = healthy
    cancel: 2.5, // under 2.5% = healthy
  }

  const statusFor = (value, threshold) => {
    if (value === 0) return 'healthy'
    if (value < threshold) return 'healthy'
    if (value < threshold * 2) return 'warning'
    return 'critical'
  }

  const customerServiceStatus = statusFor(defectRate, THRESHOLDS.defect)
  const shippingStatus = statusFor(lateShipRate, THRESHOLDS.late)
  const policyStatus = 'healthy'
  const productComplianceStatus = computeProductCompliance(products || [])

  // Overall = worst of the sections
  const overallStatus = worstStatus([
    customerServiceStatus,
    shippingStatus,
    policyStatus,
    productComplianceStatus,
  ])

  // Alerts
  const alerts = []
  if (defectRate >= THRESHOLDS.defect) {
    alerts.push({
      tone: defectRate >= THRESHOLDS.defect * 2 ? 'critical' : 'warning',
      title: 'Order Defect Rate above target',
      detail: `Currently ${defectRate.toFixed(2)}% — keep it under ${THRESHOLDS.defect}%.`,
      to: '/seller/orders',
    })
  }
  if (cancelRate >= THRESHOLDS.cancel) {
    alerts.push({
      tone: cancelRate >= THRESHOLDS.cancel * 2 ? 'critical' : 'warning',
      title: 'Cancellation Rate above target',
      detail: `Currently ${cancelRate.toFixed(2)}% — keep it under ${THRESHOLDS.cancel}%.`,
      to: '/seller/orders',
    })
  }
  if (pendingShipments.length > 5) {
    alerts.push({
      tone: 'warning',
      title: `${pendingShipments.length} orders awaiting shipment`,
      detail: 'Ship promptly to keep your Late Shipment Rate low.',
      to: '/seller/fulfillment',
    })
  }
  const missingImages = (products || []).filter(
    (p) => !p.image_url && p.is_active !== false
  )
  if (missingImages.length > 0) {
    alerts.push({
      tone: 'warning',
      title: `${missingImages.length} active product${missingImages.length > 1 ? 's' : ''} missing images`,
      detail: 'Products need at least one image to stay visible in search.',
      to: '/seller/products',
    })
  }
  const missingDesc = (products || []).filter(
    (p) => !p.description && p.is_active !== false
  )
  if (missingDesc.length > 0) {
    alerts.push({
      tone: 'warning',
      title: `${missingDesc.length} product${missingDesc.length > 1 ? 's' : ''} missing descriptions`,
      detail: 'Add descriptions to improve conversion.',
      to: '/seller/products',
    })
  }
  const outOfStockActive = (products || []).filter(
    (p) => p.is_active !== false && (p.stock || 0) === 0
  )
  if (outOfStockActive.length > 0) {
    alerts.push({
      tone: 'critical',
      title: `${outOfStockActive.length} active product${outOfStockActive.length > 1 ? 's' : ''} out of stock`,
      detail: 'These listings may be suppressed until restocked.',
      to: '/seller/inventory',
    })
  }

  // 30-day trend — score per day based on whether any cancelled order landed that day
  const series = buildHealthSeries(orders, 30)

  return {
    overallStatus,
    sections: {
      customerService: {
        status: customerServiceStatus,
        metrics: [
          { label: 'Order Defect Rate', value: defectRate.toFixed(2) + '%', threshold: '< ' + THRESHOLDS.defect + '%' },
          { label: 'Cancellation Rate', value: cancelRate.toFixed(2) + '%', threshold: '< ' + THRESHOLDS.cancel + '%' },
          { label: 'Customer Response Time', value: '< 24 hours', threshold: '< 24 hours' },
        ],
      },
      shipping: {
        status: shippingStatus,
        metrics: [
          { label: 'Late Shipment Rate', value: lateShipRate.toFixed(2) + '%', threshold: '< ' + THRESHOLDS.late + '%' },
          { label: 'Pre-fulfillment Cancel Rate', value: cancelRate.toFixed(2) + '%', threshold: '< 2.5%' },
          { label: 'On-time Delivery', value: '98.7%', threshold: '> 95%' },
        ],
      },
      policy: {
        status: 'healthy',
        metrics: [
          { label: 'Policy Violations', value: '0', threshold: '0' },
          { label: 'Restricted Products', value: '0', threshold: '0' },
          { label: 'IP Complaints', value: '0', threshold: '0' },
        ],
      },
      productCompliance: {
        status: productComplianceStatus,
        metrics: [
          { label: 'Products Missing Images', value: missingImages.length, threshold: '0' },
          { label: 'Products Missing Descriptions', value: missingDesc.length, threshold: '0' },
          { label: 'Suppressed Listings', value: outOfStockActive.length, threshold: '0' },
        ],
      },
    },
    alerts,
    series,
    counts: {
      totalOrders,
      cancelledOrders,
      returnedOrders,
      pendingShipments: pendingShipments.length,
    },
  }
}

function computeProductCompliance(products) {
  const issues = products.filter(
    (p) =>
      (p.is_active !== false && !p.image_url) ||
      (p.is_active !== false && !p.description) ||
      (p.is_active !== false && (p.stock || 0) === 0)
  ).length
  if (issues === 0) return 'healthy'
  if (issues <= 2) return 'warning'
  return 'critical'
}

function worstStatus(list) {
  if (list.includes('critical')) return 'critical'
  if (list.includes('warning')) return 'warning'
  return 'healthy'
}

function buildHealthSeries(orders, days) {
  const out = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(day.getDate() - i)
    const key = day.toISOString().slice(0, 10)
    const dayOrders = orders.filter(
      (o) => o.created_at && o.created_at.slice(0, 10) === key
    )
    const cancelled = dayOrders.filter(
      (o) => (o.order_status || '').toLowerCase() === 'cancelled'
    ).length
    // Score from 0 (bad) to 100 (good)
    const score =
      dayOrders.length === 0
        ? 100
        : Math.max(0, 100 - (cancelled / dayOrders.length) * 100)
    out.push({
      label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(score),
    })
  }
  return out
}

/**
 * Fetch all reviews across the seller's products.
 */
export async function getSellerReviews(userId) {
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, title, image_url, rating, review_count')
    .eq('seller_id', userId)
  if (pErr) throw pErr

  const productIds = (products || []).map((p) => p.id)
  if (productIds.length === 0) return []

  const { data: reviews, error: rErr } = await supabase
    .from('reviews')
    .select('*, products(id, title, image_url)')
    .in('product_id', productIds)
    .order('created_at', { ascending: false })
  if (rErr) throw rErr

  return (reviews || []).map((r) => ({
    ...r,
    product: r.products,
  }))
}

/**
 * Deterministic fallback review analysis when AI is unavailable.
 * Uses simple keyword detection to bucket feedback.
 */
export function localReviewAnalysis(reviews) {
  const positives = []
  const negatives = []
  const complaints = []
  const requests = []

  const positiveWords = ['great', 'good', 'excellent', 'love', 'amazing', 'perfect', 'quality', 'recommend', 'happy', 'works', 'fast', 'comfortable']
  const negativeWords = ['bad', 'poor', 'terrible', 'broken', 'damaged', 'slow', 'disappoint', 'cheap', 'defect', 'returned', 'refund', 'waste']
  const complaintWords = ['packaging', 'shipping', 'arrived', 'battery', 'sound', 'size', 'fit', 'color', 'late']
  const requestWords = ['wish', 'should', 'would be', 'could be', 'hope', 'need', 'want']

  for (const r of reviews) {
    const text = ((r.title || '') + ' ' + (r.body || '')).toLowerCase()
    const star = Number(r.rating)

    if (star >= 4) {
      for (const w of positiveWords) {
        if (text.includes(w)) {
          positives.push(`${capitalize(w)} — "${shorten(r.body)}"`)
          break
        }
      }
    }
    if (star <= 2) {
      for (const w of negativeWords) {
        if (text.includes(w)) {
          negatives.push(`${capitalize(w)} — "${shorten(r.body)}"`)
          break
        }
      }
    }
    for (const w of complaintWords) {
      if (text.includes(w)) {
        complaints.push(`${capitalize(w)}: "${shorten(r.body)}"`)
        break
      }
    }
    for (const w of requestWords) {
      const idx = text.indexOf(w)
      if (idx !== -1) {
        requests.push(`"${shorten(r.body)}"`)
        break
      }
    }
  }

  // Deduplicate + cap at 4 each
  return {
    positiveThemes: [...new Set(positives)].slice(0, 4),
    negativeThemes: [...new Set(negatives)].slice(0, 4),
    commonComplaints: [...new Set(complaints)].slice(0, 4),
    customerRequests: [...new Set(requests)].slice(0, 4),
    aiUsed: false,
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
function shorten(s, n = 80) {
  if (!s) return ''
  return s.length <= n ? s : s.slice(0, n) + '…'
}

/**
 * Fetch all messages for the seller, grouped into threads.
 * Returns array of threads sorted by most-recent activity.
 */
export async function getSellerMessageThreads(userId) {
  const { data, error } = await supabase
    .from('seller_messages')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error

  const byThread = {}
  for (const m of data || []) {
    if (!byThread[m.thread_id]) byThread[m.thread_id] = []
    byThread[m.thread_id].push(m)
  }

  const threads = Object.entries(byThread).map(([threadId, messages]) => {
    const last = messages[messages.length - 1]
    const hasUnread = messages.some(
      (m) => m.direction === 'inbound' && m.status === 'unread'
    )
    const replied = messages.some((m) => m.direction === 'outbound')
    return {
      thread_id: threadId,
      messages,
      subject: messages[0].subject || 'No subject',
      customer_name: messages[0].customer_name || 'Customer',
      customer_email: messages[0].customer_email,
      order_id: messages.find((m) => m.order_id)?.order_id || null,
      last_message_at: last.created_at,
      last_preview: (last.body || '').slice(0, 80),
      status: hasUnread ? 'unread' : replied ? 'replied' : 'read',
      message_count: messages.length,
    }
  })

  threads.sort(
    (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
  )
  return threads
}

/**
 * Send a seller reply. Creates an outbound message in the same thread,
 * and marks inbound messages in the thread as 'replied'.
 */
export async function sendSellerReply(userId, threadId, body) {
  const { data: thread } = await supabase
    .from('seller_messages')
    .select('subject, customer_name, customer_email, order_id')
    .eq('thread_id', threadId)
    .eq('seller_id', userId)
    .limit(1)
    .maybeSingle()

  const subject = thread?.subject
    ? thread.subject.startsWith('Re:')
      ? thread.subject
      : 'Re: ' + thread.subject
    : 'Re: Your inquiry'

  const { data, error } = await supabase
    .from('seller_messages')
    .insert({
      seller_id: userId,
      thread_id: threadId,
      order_id: thread?.order_id || null,
      customer_name: thread?.customer_name || null,
      customer_email: thread?.customer_email || null,
      subject,
      body,
      direction: 'outbound',
      status: 'replied',
    })
    .select()
    .maybeSingle()
  if (error) throw error

  // Mark inbound messages in this thread as replied
  await supabase
    .from('seller_messages')
    .update({ status: 'replied' })
    .eq('thread_id', threadId)
    .eq('seller_id', userId)
    .eq('direction', 'inbound')

  return data
}

/**
 * Mark all inbound messages in a thread as read.
 */
export async function markThreadRead(userId, threadId) {
  const { error } = await supabase
    .from('seller_messages')
    .update({ status: 'read' })
    .eq('thread_id', threadId)
    .eq('seller_id', userId)
    .eq('direction', 'inbound')
    .eq('status', 'unread')
  if (error) throw error
}

/**
 * Fetch all support cases for this seller.
 */
export async function getSupportCases(userId) {
  const { data, error } = await supabase
    .from('support_cases')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Create a new support case.
 */
export async function createSupportCase(userId, payload) {
  const { data, error } = await supabase
    .from('support_cases')
    .insert({
      seller_id: userId,
      order_id: payload.order_id || null,
      category: payload.category,
      subject: payload.subject,
      message: payload.message,
      status: 'open',
    })
    .select()
    .maybeSingle()
  if (error) throw error

  // Simulated auto-response — schedule a canned reply
  setTimeout(() => {
    supabase
      .from('support_cases')
      .update({
        status: 'pending',
        response:
          'Thank you for contacting Amazon Rebuild Seller Support. ' +
          'A specialist will review your case and respond within 24 hours. ' +
          'Your case reference is #' +
          data.id.slice(0, 8) +
          '.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .then(() => {})
  }, 6000)

  return data
}

/**
 * Close a support case.
 */
export async function closeSupportCase(userId, caseId) {
  const { error } = await supabase
    .from('support_cases')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', caseId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Update settings fields on the seller profile.
 */
export async function updateSellerSettings(userId, updates) {
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
 * Fetch team members.
 */
export async function getSellerUsers(userId) {
  const { data, error } = await supabase
    .from('seller_users')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Invite a new team member.
 */
export async function inviteSellerUser(userId, payload) {
  const { data, error } = await supabase
    .from('seller_users')
    .insert({
      seller_id: userId,
      email: payload.email,
      full_name: payload.full_name || null,
      role: payload.role || 'Employee',
      permissions: payload.permissions || undefined,
      status: 'invited',
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Update a team member's role or permissions.
 */
export async function updateSellerUser(userId, memberId, updates) {
  const { data, error } = await supabase
    .from('seller_users')
    .update(updates)
    .eq('id', memberId)
    .eq('seller_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Remove a team member.
 */
export async function removeSellerUser(userId, memberId) {
  const { error } = await supabase
    .from('seller_users')
    .delete()
    .eq('id', memberId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Role permission templates.
 */
export const ROLE_TEMPLATES = {
  Administrator: {
    products: true,
    inventory: true,
    orders: true,
    advertising: true,
    reports: true,
    payments: true,
    settings: true,
  },
  Manager: {
    products: true,
    inventory: true,
    orders: true,
    advertising: true,
    reports: true,
    payments: false,
    settings: false,
  },
  Employee: {
    products: true,
    inventory: true,
    orders: true,
    advertising: false,
    reports: false,
    payments: false,
    settings: false,
  },
  Analyst: {
    products: false,
    inventory: false,
    orders: false,
    advertising: false,
    reports: true,
    payments: false,
    settings: false,
  },
}

/**
 * Explicit notifications stored in the DB (one-time events).
 */
export async function getExplicitNotifications(userId, limit = 40) {
  const { data, error } = await supabase
    .from('seller_notifications')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

/**
 * Insert a notification row.
 */
export async function pushNotification(userId, payload) {
  const { data, error } = await supabase
    .from('seller_notifications')
    .insert({
      seller_id: userId,
      type: payload.type,
      title: payload.title,
      body: payload.body || null,
      link: payload.link || null,
      read: false,
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('seller_notifications')
    .update({ read: true })
    .eq('seller_id', userId)
    .eq('read', false)
  if (error) throw error
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(userId, notificationId) {
  const { error } = await supabase
    .from('seller_notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Delete a single notification.
 */
export async function deleteNotification(userId, notificationId) {
  const { error } = await supabase
    .from('seller_notifications')
    .delete()
    .eq('id', notificationId)
    .eq('seller_id', userId)
  if (error) throw error
}

/**
 * Derive live "state" notifications by scanning the seller's current data.
 * These are not stored — they reflect what's true right now.
 */
export async function getDerivedNotifications(userId) {
  const out = []

  // 1. Products — low stock, out of stock
  const { data: products } = await supabase
    .from('products')
    .select('id, title, stock, low_stock_threshold, is_active')
    .eq('seller_id', userId)

  const low = (products || []).filter(
    (p) => p.is_active !== false && p.stock > 0 && p.stock <= (p.low_stock_threshold || 5)
  )
  if (low.length > 0) {
    out.push({
      id: 'derived-low-stock',
      type: 'low_inventory',
      title: `${low.length} product${low.length > 1 ? 's' : ''} low on stock`,
      body: low
        .slice(0, 3)
        .map((p) => `${p.title} (${p.stock} left)`)
        .join(' · '),
      link: '/seller/inventory',
      created_at: new Date().toISOString(),
      read: false,
      derived: true,
    })
  }

  const oos = (products || []).filter(
    (p) => p.is_active !== false && p.stock === 0
  )
  if (oos.length > 0) {
    out.push({
      id: 'derived-oos',
      type: 'product_suppressed',
      title: `${oos.length} active product${oos.length > 1 ? 's' : ''} out of stock`,
      body: oos
        .slice(0, 3)
        .map((p) => p.title)
        .join(' · '),
      link: '/seller/inventory',
      created_at: new Date().toISOString(),
      read: false,
      derived: true,
    })
  }

  // 2. Unread customer messages
  const { data: msgs } = await supabase
    .from('seller_messages')
    .select('id, subject, customer_name, created_at')
    .eq('seller_id', userId)
    .eq('direction', 'inbound')
    .eq('status', 'unread')
    .order('created_at', { ascending: false })
    .limit(5)

  if (msgs && msgs.length > 0) {
    out.push({
      id: 'derived-unread-messages',
      type: 'customer_message',
      title: `${msgs.length} unread customer message${msgs.length > 1 ? 's' : ''}`,
      body: msgs
        .slice(0, 3)
        .map((m) => `${m.customer_name}: ${m.subject}`)
        .join(' · '),
      link: '/seller/messages',
      created_at: msgs[0].created_at,
      read: false,
      derived: true,
    })
  }

  // 3. Orders awaiting shipment
  const { data: items } = await supabase
    .from('order_items')
    .select('id, order_id')
    .in(
      'product_id',
      (products || []).map((p) => p.id)
    )

  if (items && items.length > 0) {
    const orderIds = [...new Set(items.map((i) => i.order_id))]
    const { data: pending } = await supabase
      .from('orders')
      .select('id, created_at')
      .in('id', orderIds)
      .in('order_status', ['order_placed', 'processing', 'packed'])
      .order('created_at', { ascending: false })

    if (pending && pending.length > 0) {
      out.push({
        id: 'derived-pending-orders',
        type: 'new_order',
        title: `${pending.length} order${pending.length > 1 ? 's' : ''} awaiting shipment`,
        body: pending
          .slice(0, 3)
          .map((o) => '#' + o.id.slice(0, 8))
          .join(' · '),
        link: '/seller/fulfillment',
        created_at: pending[0].created_at,
        read: false,
        derived: true,
      })
    }
  }

  // 4. Account health warnings
  try {
    const health = await getSellerHealth(userId)
    if (health.overallStatus !== 'healthy') {
      out.push({
        id: 'derived-health',
        type: 'policy',
        title:
          health.overallStatus === 'critical'
            ? 'Account Health: Critical'
            : 'Account Health: At risk',
        body: `${health.alerts.length} alert${health.alerts.length !== 1 ? 's' : ''} need attention`,
        link: '/seller/account-health',
        created_at: new Date().toISOString(),
        read: false,
        derived: true,
      })
    }
  } catch {
    // skip — health check may fail if user has no data
  }

  return out
}

/**
 * Merge explicit + derived notifications, sort by date desc.
 */
export async function getAllNotifications(userId) {
  const [explicit, derived] = await Promise.all([
    getExplicitNotifications(userId),
    getDerivedNotifications(userId),
  ])
  const merged = [...explicit, ...derived]
  merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return merged
}

/**
 * Fetch all connected apps for this seller.
 */
export async function getConnectedApps(userId) {
  const { data, error } = await supabase
    .from('connected_apps')
    .select('*')
    .eq('seller_id', userId)
    .eq('status', 'active')
    .order('connected_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Connect an app (simulated OAuth grant).
 */
export async function connectApp(userId, app) {
  const { data, error } = await supabase
    .from('connected_apps')
    .upsert(
      {
        seller_id: userId,
        app_id: app.id,
        app_name: app.name,
        app_developer: app.developer,
        app_category: app.category,
        permissions: app.permissions || [],
        status: 'active',
        connected_at: new Date().toISOString(),
        revoked_at: null,
      },
      { onConflict: 'seller_id,app_id' }
    )
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Revoke access to an app.
 */
export async function revokeApp(userId, appId) {
  const { error } = await supabase
    .from('connected_apps')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('seller_id', userId)
    .eq('app_id', appId)
  if (error) throw error
}

/**
 * Aggregate growth data for the seller.
 * Derives opportunities + metrics from real products and orders.
 */
export async function getSellerGrowth(userId) {
  // 1. Seller's products
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, title, price, stock, image_url, rating, review_count, description, category_id, seller_id')
    .eq('seller_id', userId)
  if (pErr) throw pErr

  if (!products || products.length === 0) {
    return emptyGrowth()
  }

  const productIds = products.map((p) => p.id)

  // 2. Order items for these products
  const { data: items } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, price, quantity, created_at')
    .in('product_id', productIds)

  // 3. Parent orders (for date-based metrics)
  const orderIds = [...new Set((items || []).map((i) => i.order_id))]
  let orders = []
  if (orderIds.length) {
    const { data: o } = await supabase
      .from('orders')
      .select('id, created_at, order_status, total')
      .in('id', orderIds)
    orders = o || []
  }
  const ordersById = Object.fromEntries(orders.map((o) => [o.id, o]))

  // 4. Per-product metrics
  const perProduct = {}
  for (const p of products) {
    perProduct[p.id] = {
      product: p,
      sales: 0,
      units: 0,
      orderCount: 0,
      // Simulated sessions based on review count + stock as a stable seed
      sessions: Math.max(50, (p.review_count || 0) * 12 + (p.stock || 0) * 3),
    }
  }

  for (const it of items || []) {
    const bucket = perProduct[it.product_id]
    if (!bucket) continue
    const o = ordersById[it.order_id]
    if (!o) continue
    if (['cancelled', 'returned'].includes((o.order_status || '').toLowerCase())) continue
    const lineTotal = Number(it.price) * Number(it.quantity)
    bucket.sales += lineTotal
    bucket.units += Number(it.quantity)
    bucket.orderCount += 1
  }

  // 5. Compute conversion per product
  for (const p of products) {
    const b = perProduct[p.id]
    b.conversion = b.sessions > 0 ? (b.units / b.sessions) * 100 : 0
    b.averageOrderValue = b.orderCount > 0 ? b.sales / b.orderCount : 0
  }

  // 6. Generate opportunities based on real data
  const opportunities = generateOpportunities(products, perProduct)

  // 7. Growth metrics for the last 30 days
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 86400000
  let sales30d = 0
  let units30d = 0
  const orders30d = new Set()
  for (const it of items || []) {
    const o = ordersById[it.order_id]
    if (!o) continue
    if (new Date(o.created_at).getTime() < thirtyDaysAgo) continue
    if (['cancelled', 'returned'].includes((o.order_status || '').toLowerCase())) continue
    sales30d += Number(it.price) * Number(it.quantity)
    units30d += Number(it.quantity)
    orders30d.add(it.order_id)
  }
  const sessions30d = products.reduce((s, p) => s + perProduct[p.id].sessions, 0)
  const conversion30d = sessions30d > 0 ? (units30d / sessions30d) * 100 : 0

  // 8. Summary tiles
  const highPriority = opportunities.filter((o) => o.impact === 'High').length
  const potentialImpact = opportunities.reduce((s, o) => s + (o.estimatedValue || 0), 0)

  // 9. Sort products by sales for the product performance table
  const topProducts = products
    .map((p) => perProduct[p.id])
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8)

  return {
    metrics: {
      sales: +sales30d.toFixed(2),
      orders: orders30d.size,
      units: units30d,
      sessions: sessions30d,
      conversion: +conversion30d.toFixed(2),
    },
    summary: {
      total: opportunities.length,
      potentialImpact: Math.round(potentialImpact),
      productsNeedingAction: new Set(opportunities.map((o) => o.productId)).size,
      highPriority,
    },
    opportunities,
    topProducts,
    products: products.map((p) => perProduct[p.id]),
  }
}

/**
 * Generate opportunities from real product data using simple heuristics.
 * Categories match Amazon's Growth Opportunities framework.
 */
function generateOpportunities(products, perProduct) {
  const out = []

  for (const p of products) {
    const b = perProduct[p.id]
    const p_ = b.product

    // Category: Improve Sales
    // Missing images or short description
    if (!p_.image_url && p_.stock > 0) {
      out.push({
        id: `improve-images-${p_.id}`,
        productId: p_.id,
        productTitle: p_.title,
        productImage: p_.image_url,
        category: 'Improve Sales',
        title: 'Add product images',
        description:
          'Listings with high-quality images convert 2–3x better. Add at least one main image.',
        impact: 'High',
        estimatedValue: Math.max(100, b.sales * 0.2),
        recommendedAction: 'Improve Listing',
        actionLink: `/seller/products/${p_.id}/edit`,
      })
    }

    if (!p_.description || p_.description.length < 80) {
      out.push({
        id: `improve-description-${p_.id}`,
        productId: p_.id,
        productTitle: p_.title,
        productImage: p_.image_url,
        category: 'Improve Sales',
        title: 'Improve product description',
        description:
          'A detailed description improves SEO and conversion. Aim for 3–4 paragraphs.',
        impact: b.sales > 200 ? 'High' : 'Medium',
        estimatedValue: Math.max(50, b.sales * 0.1),
        recommendedAction: 'Improve Listing',
        actionLink: `/seller/products/${p_.id}/edit`,
      })
    }

    // Low conversion but has sales
    if (b.conversion > 0 && b.conversion < 3 && b.sales > 100) {
      out.push({
        id: `improve-conversion-${p_.id}`,
        productId: p_.id,
        productTitle: p_.title,
        productImage: p_.image_url,
        category: 'Improve Sales',
        title: 'Improve product detail page',
        description: `This product converts at ${b.conversion.toFixed(1)}% — below the healthy threshold of 3%. Improve title, bullets, and A+ content.`,
        impact: 'High',
        estimatedValue: Math.max(200, b.sales * 0.3),
        recommendedAction: 'Improve Listing',
        actionLink: `/seller/products/${p_.id}/edit`,
      })
    }

    // Low rating
    if (p_.rating && p_.rating < 4 && p_.review_count > 0) {
      out.push({
        id: `improve-rating-${p_.id}`,
        productId: p_.id,
        productTitle: p_.title,
        productImage: p_.image_url,
        category: 'Improve Sales',
        title: 'Address customer complaints',
        description: `Current rating is ${p_.rating.toFixed(1)}★. Analyze reviews to identify and fix common complaints.`,
        impact: 'Medium',
        estimatedValue: Math.max(100, b.sales * 0.15),
        recommendedAction: 'Analyze Reviews',
        actionLink: '/seller/reviews',
      })
    }

    // Category: Drive Traffic
    // Product has reviews but low sessions
    if (p_.review_count > 0 && b.sessions < 500) {
      out.push({
        id: `drive-traffic-${p_.id}`,
        productId: p_.id,
        productTitle: p_.title,
        productImage: p_.image_url,
        category: 'Drive Traffic',
        title: 'Launch Sponsored Products campaign',
        description: `Only ${b.sessions} sessions this period. Run ads to increase visibility for this listing.`,
        impact: b.sales > 100 ? 'High' : 'Medium',
        estimatedValue: Math.max(150, b.sales * 0.4),
        recommendedAction: 'Create Campaign',
        actionLink: '/seller/advertising',
      })
    }

    // Category: Reduce Cost
    // Oversized inventory that isn't selling
    if (p_.stock > 50 && b.sales < 100) {
      out.push({
        id: `reduce-storage-${p_.id}`,
        productId: p_.id,
        productTitle: p_.title,
        productImage: p_.image_url,
        category: 'Reduce Cost',
        title: 'Reduce excess inventory',
        description: `${p_.stock} units in stock with low sell-through. Consider promotions or removing excess inventory.`,
        impact: 'Medium',
        estimatedValue: 300,
        recommendedAction: 'Create Deal',
        actionLink: '/seller/deals',
      })
    }

    // Out of stock
    if ((p_.stock || 0) === 0 && b.sales > 0) {
      out.push({
        id: `restock-${p_.id}`,
        productId: p_.id,
        productTitle: p_.title,
        productImage: p_.image_url,
        category: 'Sell New Products',
        title: 'Restock this best-seller',
        description:
          'This product is out of stock but previously sold well. Restock to avoid losing sales.',
        impact: 'High',
        estimatedValue: Math.max(200, b.sales * 0.5),
        recommendedAction: 'Restock',
        actionLink: '/seller/inventory',
      })
    }
  }

  // Category: Sell New Products — generic opportunity if few products
  if (products.length < 5) {
    out.push({
      id: 'expand-catalog',
      productId: null,
      productTitle: 'Your catalog',
      productImage: null,
      category: 'Sell New Products',
      title: 'Expand your catalog',
      description:
        'You have only a few products. Adding more SKUs (especially in high-demand categories) can significantly increase revenue.',
      impact: 'High',
      estimatedValue: 500,
      recommendedAction: 'Add Product',
      actionLink: '/seller/products/new',
    })
  }

  // Sort by impact (High > Medium > Low), then by estimated value
  const order = { High: 0, Medium: 1, Low: 2 }
  out.sort((a, b) => {
    const i = order[a.impact] - order[b.impact]
    if (i !== 0) return i
    return b.estimatedValue - a.estimatedValue
  })

  return out
}

function emptyGrowth() {
  return {
    metrics: { sales: 0, orders: 0, units: 0, sessions: 0, conversion: 0 },
    summary: { total: 0, potentialImpact: 0, productsNeedingAction: 0, highPriority: 0 },
    opportunities: [],
    topProducts: [],
    products: [],
  }
}

/**
 * Persist the current opportunity set for a seller.
 * Called from SellerGrowth after computing opportunities. Upserts without
 * touching status — preserves user changes like Completed/Dismissed.
 */
export async function syncGrowthOpportunities(userId, opportunities) {
  if (!opportunities || opportunities.length === 0) return
  const rows = opportunities.map((o) => ({
    id: o.id,
    seller_id: userId,
    product_id: o.productId || null,
    product_title: o.productTitle,
    product_image: o.productImage || null,
    category: o.category,
    title: o.title,
    description: o.description,
    impact: o.impact,
    estimated_value: o.estimatedValue || 0,
    recommended_action: o.recommendedAction,
    action_link: o.actionLink || null,
    updated_at: new Date().toISOString(),
  }))
  // Ignore duplicates and don't touch status column
  const { error } = await supabase
    .from('growth_opportunities')
    .upsert(rows, { onConflict: 'seller_id,id', ignoreDuplicates: true })
  if (error) throw error
}

/**
 * Fetch persisted statuses for the seller's opportunities.
 * Returns a map: id -> { status, updated_at }
 */
export async function getGrowthStatuses(userId) {
  const { data, error } = await supabase
    .from('growth_opportunities')
    .select('id, status, updated_at')
    .eq('seller_id', userId)
  if (error) throw error
  const map = {}
  for (const row of data || []) map[row.id] = row
  return map
}

/**
 * Fetch a single persisted opportunity (with status).
 */
export async function getGrowthOpportunity(userId, oppId) {
  const { data, error } = await supabase
    .from('growth_opportunities')
    .select('*')
    .eq('seller_id', userId)
    .eq('id', oppId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Update an opportunity's status.
 */
export async function updateOpportunityStatus(userId, oppId, status) {
  const { error } = await supabase
    .from('growth_opportunities')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('seller_id', userId)
    .eq('id', oppId)
  if (error) throw error
}

/**
 * Mark an opportunity in-progress by ID (used after user takes action).
 */
export async function markOpportunityInProgress(userId, oppId) {
  return updateOpportunityStatus(userId, oppId, 'in_progress')
}

/**
 * Fetch all returns for a seller, optionally filtered.
 */
export async function getSellerReturns(userId) {
  const { data, error } = await supabase
    .from('returns')
    .select('*')
    .eq('seller_id', userId)
    .order('requested_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Fetch a single return by ID.
 */
export async function getSellerReturn(userId, returnId) {
  const { data, error } = await supabase
    .from('returns')
    .select('*')
    .eq('seller_id', userId)
    .eq('id', returnId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Aggregate counts for the summary tiles.
 */
export function computeReturnsSummary(returns) {
  const now = Date.now()
  return {
    pendingActions: returns.filter((r) =>
      ['requested', 'pending_authorization'].includes(r.status)
    ).length,
    inTransit: returns.filter((r) => r.status === 'return_in_transit').length,
    received: returns.filter((r) => r.status === 'return_received').length,
    refundPending: returns.filter((r) => r.status === 'refund_pending').length,
    refunded: returns.filter((r) => r.status === 'refunded').length,
    declined: returns.filter((r) => r.status === 'declined').length,
    total: returns.length,
    refundedAmount: returns
      .filter((r) => r.status === 'refunded')
      .reduce((s, r) => s + Number(r.refund_amount || 0), 0),
  }
}

/**
 * Authorize a return — status moves to 'authorized', carrier/tracking set.
 */
export async function authorizeReturn(userId, returnId, payload) {
  const { data, error } = await supabase
    .from('returns')
    .update({
      status: 'authorized',
      authorization_status: 'authorized',
      return_method: payload.return_method || 'prepaid_label',
      carrier: payload.carrier || 'UPS',
      tracking_number: payload.tracking_number || generateTracking(),
      authorized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', returnId)
    .eq('seller_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Decline a return.
 */
export async function declineReturn(userId, returnId, reason, notes) {
  const { data, error } = await supabase
    .from('returns')
    .update({
      status: 'declined',
      authorization_status: 'declined',
      seller_notes: (reason ? '[Declined: ' + reason + '] ' : '') + (notes || ''),
      updated_at: new Date().toISOString(),
    })
    .eq('id', returnId)
    .eq('seller_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Mark the return as in transit (after authorization).
 */
export async function markReturnShipped(userId, returnId) {
  const { data, error } = await supabase
    .from('returns')
    .update({
      status: 'return_in_transit',
      shipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', returnId)
    .eq('seller_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Mark the return as received, with a condition assessment.
 */
export async function receiveReturn(userId, returnId, payload) {
  const { data, error } = await supabase
    .from('returns')
    .update({
      status: 'refund_pending',
      condition: payload.condition || 'used',
      seller_notes: payload.seller_notes || null,
      received_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', returnId)
    .eq('seller_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Issue a refund (full or partial), optionally with a restocking fee.
 */
export async function issueRefund(userId, returnId, payload) {
  const { amount, type, restocking_fee } = payload
  const { data, error } = await supabase
    .from('returns')
    .update({
      status: 'refunded',
      refund_status: type === 'full' ? 'full' : type === 'partial' ? 'partial' : 'none',
      refund_amount: Number(amount) || 0,
      restocking_fee: Number(restocking_fee) || 0,
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', returnId)
    .eq('seller_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Fetch all messages for a return.
 */
export async function getReturnMessages(userId, returnId) {
  const { data, error } = await supabase
    .from('return_messages')
    .select('*')
    .eq('return_id', returnId)
    .eq('seller_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Send a seller message on a return.
 */
export async function sendReturnMessage(userId, returnId, body) {
  const { data, error } = await supabase
    .from('return_messages')
    .insert({
      return_id: returnId,
      seller_id: userId,
      direction: 'outbound',
      author: 'You',
      body,
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Returns the current step index for the timeline (0-based).
 */
export function returnTimelineIndex(status) {
  const steps = [
    'requested',
    'pending_authorization',
    'authorized',
    'return_in_transit',
    'return_received',
    'refund_pending',
    'refunded',
    'completed',
  ]
  const idx = steps.indexOf(status)
  if (status === 'declined') return -1
  return idx === -1 ? 0 : idx
}

function generateTracking() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let s = '1Z'
  for (let i = 0; i < 14; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}