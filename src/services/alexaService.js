/**
 * Alexa for Shopping — real AI assistant backed by Groq.
 * Sends the conversation + catalog summary to /api/ai and receives
 * structured JSON: { text, product_ids, action }.
 */

async function callAI(systemPrompt, userPrompt) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error('AI proxy ' + res.status + ': ' + t.slice(0, 150))
  }
  const data = await res.json()
  if (!data.content) throw new Error('Empty AI response')
  return data.content
}

function extractJson(text) {
  const clean = text.replace(/```json|```/g, '').trim()
  const a = clean.indexOf('{')
  const b = clean.lastIndexOf('}')
  if (a === -1 || b === -1) return null
  try {
    return JSON.parse(clean.slice(a, b + 1))
  } catch {
    return null
  }
}

/**
 * Compact product summary for the prompt. Keeps tokens low.
 */
function summarizeCatalog(products, limit = 30) {
  return products
    .slice(0, limit)
    .map(
      (p) =>
        `ID:${p.id} | ${p.title} | $${Number(p.price).toFixed(2)} | ${
          p.brand || 'no brand'
        } | rating ${Number(p.rating || 0).toFixed(1)} | ${(p.description || '').slice(0, 100)}`
    )
    .join('\n')
}

/**
 * Send a message with context. Returns { text, product_ids, action, action_product_id }.
 */
export async function askAlexa({ message, history = [], products = [] }) {
  const catalog = summarizeCatalog(products)

  const system =
    'You are Alexa for Shopping, an AI assistant on Amazon Rebuild. ' +
    'You help shoppers find products, compare options, answer questions, and take actions. ' +
    'You have access to a catalog of products listed below. ' +
    'You always respond in STRICT JSON with these keys:\n' +
    '  "text": a helpful conversational reply (2-4 sentences, no markdown)\n' +
    '  "product_ids": an array of relevant product IDs from the catalog (max 4, empty if none apply)\n' +
    '  "action": null, "add_to_cart", or "compare"\n' +
    '  "action_product_id": the product ID if action is "add_to_cart", otherwise null\n\n' +
    'Rules:\n' +
    '- Only reference product IDs that appear in the catalog.\n' +
    '- If the user asks for a specific product ("add the first one"), set action="add_to_cart" and action_product_id to the ID of the product they referenced from the most recent product_ids.\n' +
    '- If the user asks to compare, return up to 4 IDs in product_ids and set action="compare".\n' +
    '- If nothing in the catalog matches, return an empty product_ids array and explain why in text.\n' +
    '- Never invent products. Never fabricate prices. Use only the catalog below.\n' +
    '- Keep text conversational and warm.'

  const historyBlock =
    history.length > 0
      ? '\n\nRecent conversation:\n' +
        history
          .slice(-6)
          .map((m) => `${m.role === 'user' ? 'User' : 'Alexa'}: ${m.text}`)
          .join('\n')
      : ''

  const user =
    `Catalog:\n${catalog}\n\n` +
    `User message: ${message}` +
    historyBlock +
    '\n\nRespond with ONLY the JSON object.'

  const raw = await callAI(system, user)
  const parsed = extractJson(raw)

  if (!parsed) {
    // Fallback — treat the raw text as a plain reply
    return {
      text: raw.slice(0, 400),
      product_ids: [],
      action: null,
      action_product_id: null,
      aiUsed: true,
    }
  }

  return {
    text: String(parsed.text || '').trim() || 'I found some options for you.',
    product_ids: Array.isArray(parsed.product_ids)
      ? parsed.product_ids.filter((id) => typeof id === 'string').slice(0, 4)
      : [],
    action: parsed.action || null,
    action_product_id: parsed.action_product_id || null,
    aiUsed: true,
  }
}