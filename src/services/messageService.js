import { supabase } from './supabase'

/**
 * Fetch all message threads where the signed-in user is the CUSTOMER.
 * A thread is "customer-owned" if the seller is on the other side and the
 * customer_email matches the current user.
 */
export async function getCustomerThreads(userEmail) {
  if (!userEmail) return []
  const { data, error } = await supabase
    .from('seller_messages')
    .select('*')
    .eq('customer_email', userEmail)
    .order('created_at', { ascending: true })
  if (error) throw error

  const byThread = {}
  for (const m of data || []) {
    if (!byThread[m.thread_id]) byThread[m.thread_id] = []
    byThread[m.thread_id].push(m)
  }

  const threads = Object.entries(byThread).map(([threadId, messages]) => {
    const last = messages[messages.length - 1]
    return {
      thread_id: threadId,
      messages,
      subject: messages[0].subject || 'Message',
      seller_id: messages[0].seller_id,
      order_id: messages.find((m) => m.order_id)?.order_id || null,
      last_message_at: last.created_at,
      last_preview: (last.body || '').slice(0, 80),
      has_reply: messages.some((m) => m.direction === 'outbound'),
      has_unread_reply: messages.some(
        (m) => m.direction === 'outbound' && m.status !== 'read'
      ),
    }
  })

  threads.sort(
    (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
  )
  return threads
}

/**
 * Start a new thread from the customer side.
 * Creates a message row with direction='inbound' (from the customer's perspective).
 * Returns the created message.
 */
export async function sendCustomerMessage({
  sellerId,
  orderId,
  customerName,
  customerEmail,
  subject,
  body,
}) {
  const { data, error } = await supabase
    .from('seller_messages')
    .insert({
      seller_id: sellerId,
      order_id: orderId || null,
      thread_id: crypto.randomUUID(),
      customer_name: customerName,
      customer_email: customerEmail,
      subject: subject || 'Message about your order',
      body,
      direction: 'inbound',
      status: 'unread',
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Customer replies within an existing thread.
 */
export async function sendCustomerReply({
  sellerId,
  threadId,
  orderId,
  customerName,
  customerEmail,
  subject,
  body,
}) {
  const { data, error } = await supabase
    .from('seller_messages')
    .insert({
      seller_id: sellerId,
      thread_id: threadId,
      order_id: orderId || null,
      customer_name: customerName,
      customer_email: customerEmail,
      subject,
      body,
      direction: 'inbound',
      status: 'unread',
    })
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Mark seller replies as read from the customer's perspective.
 */
export async function markCustomerThreadRead(threadId) {
  const { error } = await supabase
    .from('seller_messages')
    .update({ status: 'read' })
    .eq('thread_id', threadId)
    .eq('direction', 'outbound')
  if (error) throw error
}