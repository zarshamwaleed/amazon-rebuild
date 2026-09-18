import { supabase } from './supabase'

/**
 * Fetch all gift card designs (catalog).
 */
export async function getGiftCardDesigns() {
  const { data, error } = await supabase
    .from('gift_card_designs')
    .select('*')
    .order('featured', { ascending: false })
    .order('name')
  if (error) throw error
  return data || []
}

/**
 * Fetch a single design by ID.
 */
export async function getGiftCardDesign(id) {
  const { data, error } = await supabase
    .from('gift_card_designs')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Fetch all gift cards the user purchased.
 */
export async function getMyPurchasedGiftCards(userId) {
  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Fetch all gift cards sent to the user's email.
 */
export async function getMyReceivedGiftCards(email) {
  if (!email) return []
  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('recipient_email', email)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Generate a unique claim code.
 * Format: XXXX-XXXXXX-XXXX (alphanumeric uppercase).
 */
export function generateClaimCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  const pick = (n) => {
    let s = ''
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]
    return s
  }
  return `${pick(4)}-${pick(6)}-${pick(4)}`
}

/**
 * After an order is placed, create one gift_card row per gift card order item.
 * Called from Checkout after createOrder succeeds.
 *
 * @param {string} buyerId
 * @param {string} orderId
 * @param {Array} orderItems - the rows inserted into order_items (with ids)
 * @param {Array} cartItems - the original cart items (to get recipient metadata)
 */
export async function issueGiftCardsForOrder(buyerId, orderId, orderItems, cartItems) {
  // Match order_items to gift card cart items by product_id
  const giftCardCartItems = cartItems.filter((i) => i.giftCard && i.giftCard.designId)

  if (giftCardCartItems.length === 0) return []

  const inserts = []
  for (const cartItem of giftCardCartItems) {
    const gc = cartItem.giftCard
    // Find the corresponding order_item row
    const oi = orderItems.find((row) => row.product_id === cartItem.product.id)
    inserts.push({
      code: generateClaimCode(),
      design_id: gc.designId,
      amount: Number(gc.amount) || 25,
      buyer_id: buyerId,
      order_id: orderId,
      order_item_id: oi?.id || null,
      recipient_name: gc.recipientName || null,
      recipient_email: gc.recipientEmail || null,
      sender_name: gc.senderName || null,
      message: gc.message || null,
      delivery_method: gc.deliveryMethod || 'email',
      scheduled_date: gc.scheduledDate || null,
      status: 'issued',
    })
  }

  const { data, error } = await supabase
    .from('gift_cards')
    .insert(inserts)
    .select()
  if (error) throw error
  return data || []
}

/**
 * Fetch all gift cards issued for a specific order.
 */
export async function getGiftCardsForOrder(orderId) {
  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}