import { supabase } from './supabase'

/**
 * Create an order + its items, then return the created order.
 * Caller is responsible for clearing the cart after this succeeds.
 */
export async function createOrder({
  userId,
  addressId,
  items,
  subtotal,
  shippingFee,
  tax,
  total,
  paymentMethod,
  registryId = null,
}) {
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      address_id: addressId,
      subtotal,
      shipping_fee: shippingFee,
      tax,
      total,
      payment_method: paymentMethod,
      payment_status: 'paid',
      order_status: 'order_placed',
      registry_id: registryId,
    })
    .select()
    .maybeSingle()
  if (orderErr) throw orderErr

  // Create order items (denormalized snapshot)
  const rows = items.map((i) => ({
    order_id: order.id,
    product_id: i.product.id,
    product_title: i.product.title,
    product_image: i.product.image_url,
    price: Number(i.product.price),
    quantity: i.quantity,
  }))
  const { error: itemsErr } = await supabase.from('order_items').insert(rows)
  if (itemsErr) throw itemsErr

  return order
}

export async function getUserOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), addresses(*)')
    .eq('id', orderId)
    .maybeSingle()
  if (error) throw error
  return data
}
