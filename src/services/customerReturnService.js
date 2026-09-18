import { supabase } from './supabase'

/**
 * Fetch all returns made by the signed-in customer.
 * Identified by customer_email match.
 */
export async function getCustomerReturns(customerEmail) {
  if (!customerEmail) return []
  const { data, error } = await supabase
    .from('returns')
    .select('*, products(id, title, image_url, price)')
    .eq('customer_email', customerEmail)
    .order('requested_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Fetch a single customer return by ID.
 */
export async function getCustomerReturn(returnId) {
  const { data, error } = await supabase
    .from('returns')
    .select('*, products(id, title, image_url, price)')
    .eq('id', returnId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Check whether a customer has an active return for a specific order item.
 */
export async function hasActiveReturnForProduct(customerEmail, orderId, productId) {
  if (!customerEmail || !orderId || !productId) return false
  const { data, error } = await supabase
    .from('returns')
    .select('id, status')
    .eq('customer_email', customerEmail)
    .eq('order_id', orderId)
    .eq('product_id', productId)
    .in('status', [
      'requested',
      'pending_authorization',
      'authorized',
      'return_in_transit',
      'return_received',
      'refund_pending',
    ])
    .maybeSingle()
  if (error) return false
  return Boolean(data)
}

/**
 * Create a new return request.
 */
export async function createReturnRequest({
  productId,
  orderId,
  sellerId,
  customerName,
  customerEmail,
  productTitle,
  productSku,
  productImage,
  orderTotal,
  reason,
  comment,
}) {
  const rma = 'RMA-' + Math.floor(100000 + Math.random() * 900000)

  const { data, error } = await supabase
    .from('returns')
    .insert({
      seller_id: sellerId,
      order_id: orderId,
      product_id: productId,
      rma,
      customer_name: customerName,
      customer_email: customerEmail,
      product_title: productTitle,
      product_sku: productSku,
      product_image: productImage,
      return_reason: reason,
      customer_comment: comment || null,
      status: 'pending_authorization',
      authorization_status: 'pending',
      refund_status: 'none',
      refund_amount: 0,
      order_total: orderTotal,
      return_method: 'prepaid_label',
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Add a follow-up message from the customer on a return.
 */
export async function sendCustomerReturnMessage(returnId, customerName, body) {
  const { data, error } = await supabase
    .from('return_messages')
    .insert({
      return_id: returnId,
      direction: 'inbound',
      author: customerName,
      body,
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Fetch messages for a return as the customer (read-only).
 */
export async function getReturnMessages(returnId) {
  const { data, error } = await supabase
    .from('return_messages')
    .select('*')
    .eq('return_id', returnId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Returns a map: product_id -> { id, rma, status } for the customer's returns
 * on a specific order.
 */
export async function getActiveReturnsForOrder(customerEmail, orderId) {
  if (!customerEmail || !orderId) return {}
  const { data, error } = await supabase
    .from('returns')
    .select('id, rma, product_id, status')
    .eq('customer_email', customerEmail)
    .eq('order_id', orderId)
  if (error) return {}
  const map = {}
  for (const r of data || []) map[r.product_id] = r
  return map
}