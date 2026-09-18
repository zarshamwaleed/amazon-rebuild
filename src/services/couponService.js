import { supabase } from './supabase'

/**
 * Fetch active coupons with linked product(s).
 * Excludes expired coupons.
 */
export async function getActiveCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select(
  '*, coupon_products(product_id, products(id, title, price, image_url, rating, review_count, brand, category_id))'
)
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error

  // Flatten: each row gets a `products` array
  return (data || []).map((c) => ({
    ...c,
    products: (c.coupon_products || []).map((cp) => cp.products).filter(Boolean),
  }))
}

/**
 * Coupons linked to a specific product.
 */
export async function getCouponsForProduct(productId) {
  const { data, error } = await supabase
    .from('coupon_products')
    .select('coupons(*)')
    .eq('product_id', productId)
  if (error) throw error

  const now = new Date().toISOString()
  return (data || [])
    .map((row) => row.coupons)
    .filter((c) => c && c.status === 'active' && c.end_date >= now)
}

/**
 * Coupons linked to any of a list of product IDs.
 * Returns a map: productId -> [coupons]
 */
export async function getCouponsForProducts(productIds) {
  if (!productIds || !productIds.length) return {}
  const { data, error } = await supabase
    .from('coupon_products')
    .select('product_id, coupons(*)')
    .in('product_id', productIds)
  if (error) throw error

  const now = new Date().toISOString()
  const map = {}
  for (const row of data || []) {
    const c = row.coupons
    if (!c || c.status !== 'active' || c.end_date < now) continue
    if (!map[row.product_id]) map[row.product_id] = []
    map[row.product_id].push(c)
  }
  return map
}

/**
 * Fetch the signed-in user's clipped coupons with full coupon + product data.
 */
export async function getUserCoupons(userId) {
  const { data, error } = await supabase
    .from('user_coupons')
    .select(
      'id, clipped_at, used_at, status, coupons(*, coupon_products(product_id, products(id, title, price, image_url)))'
    )
    .eq('user_id', userId)
    .order('clipped_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    coupon: row.coupons
      ? {
          ...row.coupons,
          products: (row.coupons.coupon_products || [])
            .map((cp) => cp.products)
            .filter(Boolean),
        }
      : null,
  }))
}

export async function clipCouponDB(userId, couponId) {
  const { error } = await supabase
    .from('user_coupons')
    .upsert(
      { user_id: userId, coupon_id: couponId },
      { onConflict: 'user_id,coupon_id' }
    )
  if (error) throw error
}

export async function unclipCouponDB(userId, couponId) {
  const { error } = await supabase
    .from('user_coupons')
    .delete()
    .eq('user_id', userId)
    .eq('coupon_id', couponId)
  if (error) throw error
}

/**
 * Compute the discount amount for a coupon applied to a product.
 */
export function computeDiscount(coupon, product) {
  const price = Number(product.price)
  if (!coupon || !price) return 0
  if (coupon.discount_type === 'percentage') {
    return +(price * (Number(coupon.discount_value) / 100)).toFixed(2)
  }
  return Math.min(price, Number(coupon.discount_value))
}
