/**
 * AI Listing Assistant service.
 *
 * Calls the serverless proxy at /api/ai which forwards to Groq.
 * Falls back to deterministic templates when the proxy is unreachable
 * (e.g., during `npm run dev` without `vercel dev`).
 */

const PROXY_URL = '/api/ai'

async function callAI(systemPrompt, userPrompt) {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error('AI proxy error: ' + res.status + ' — ' + text.slice(0, 200))
  }

  const data = await res.json()
  if (!data.content) throw new Error('Empty response from AI')
  return data.content.trim()
}

/* ============================================================
   Public API
   ============================================================ */

export async function enhanceListing({ title, brand, category, description, keywords }) {
  const brief = {
    title: title || '',
    brand: brand || '',
    category: category || '',
    description: description || '',
    keywords: keywords || '',
  }

  const system =
    'You are an expert Amazon product listing writer. You write clear, ' +
    'keyword-rich, benefit-driven listings that rank well and read naturally. ' +
    'You never use hype words like "best ever" or "amazing". You always respond ' +
    'in strict JSON, no markdown, no commentary.'

  const user =
    'Rewrite this product listing. Return ONLY a JSON object with these keys:\n' +
    '  "title": a 90-140 character Amazon-style title\n' +
    '  "bullet_points": an array of 5 short benefit-driven bullet strings (each under 200 chars)\n' +
    '  "description": a 3-4 sentence paragraph description\n' +
    '  "keywords": a comma-separated list of 10 relevant search keywords\n\n' +
    'Product information:\n' +
    JSON.stringify(brief, null, 2)

  try {
    const text = await callAI(system, user)
    const parsed = extractJson(text)
    if (!parsed) throw new Error('Could not parse AI response')
    return normalizeResult(parsed)
  } catch (err) {
    console.warn('[aiService] falling back to templates:', err.message)
    return templateEnhance(brief)
  }
}

export async function generateTitle({ title, brand, category }) {
  const system = 'You are an Amazon listing writer. Return ONLY the title text, nothing else.'
  const user =
    'Write a single 90-140 character Amazon product title based on: ' +
    JSON.stringify({ title, brand, category })
  try {
    const out = await callAI(system, user)
    return out.replace(/^["']|["']$/g, '').trim().slice(0, 200)
  } catch {
    return templateTitle({ title, brand, category })
  }
}

export async function generateBulletPoints({ title, description }) {
  const system = 'You are an Amazon listing writer. Return ONLY 5 bullet strings, one per line.'
  const user =
    'Write 5 benefit-driven Amazon bullet points (each under 200 chars) for: ' +
    JSON.stringify({ title, description })
  try {
    const out = await callAI(system, user)
    return out
      .split('\n')
      .map((l) => l.replace(/^[-•*\d.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 5)
  } catch {
    return templateBullets({ title, description })
  }
}

export async function improveDescription({ title, description }) {
  const system = 'You are an Amazon copywriter. Return ONLY the improved description text.'
  const user =
    'Improve this product description. Keep it factual, 3-4 sentences, no hype. ' +
    'Return only the improved text.\n\n' +
    'Title: ' + (title || '') + '\nDescription: ' + (description || '')
  try {
    const out = await callAI(system, user)
    return out.replace(/^["']|["']$/g, '').trim()
  } catch {
    return templateDescription({ title, description })
  }
}

export async function generateKeywords({ title, description, category }) {
  const system = 'You are an SEO specialist. Return ONLY a comma-separated list of 10 keywords.'
  const user =
    'Generate 10 relevant search keywords for: ' +
    JSON.stringify({ title, description, category })
  try {
    const out = await callAI(system, user)
    return out.replace(/\n/g, ', ').replace(/\s*,\s*/g, ', ').trim()
  } catch {
    return templateKeywords({ title, description, category })
  }
}

/* ============================================================
   Helpers
   ============================================================ */

function extractJson(text) {
  const clean = text.replace(/```json|```/g, '').trim()
  const firstBrace = clean.indexOf('{')
  const lastBrace = clean.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1) return null
  try {
    return JSON.parse(clean.slice(firstBrace, lastBrace + 1))
  } catch {
    return null
  }
}

function normalizeResult(obj) {
  return {
    title: (obj.title || '').toString().trim(),
    bullet_points: Array.isArray(obj.bullet_points)
      ? obj.bullet_points.map((b) => b.toString().trim()).slice(0, 5)
      : [],
    description: (obj.description || '').toString().trim(),
    keywords: (obj.keywords || '').toString().trim(),
  }
}

/* ============================================================
   Fallback templates (used when the proxy is unreachable)
   ============================================================ */

function templateEnhance(brief) {
  return {
    title: templateTitle(brief),
    bullet_points: templateBullets(brief),
    description: templateDescription(brief),
    keywords: templateKeywords(brief),
  }
}

function templateTitle({ title, brand, category }) {
  const base = (title || category || 'Premium Product').trim()
  const brandBit = brand ? brand + ' ' : ''
  const extra = category ? ' — ' + category : ''
  return (brandBit + base + extra).slice(0, 140)
}

function templateBullets({ title, description }) {
  const base = title || 'this product'
  const desc = description || ''
  const seedWords = desc
    .split(/[.,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, 3)
  const extra = seedWords.length
    ? seedWords
    : ['Premium quality build', 'Thoughtful design details']
  return [
    'Premium ' + base + ' designed for everyday use',
    ...extra.map((e) => e.charAt(0).toUpperCase() + e.slice(1)),
    "Backed by Amazon Rebuild's customer satisfaction guarantee",
  ].slice(0, 5)
}

function templateDescription({ title, description }) {
  const base = title || 'This product'
  if (description && description.length > 40) {
    return (
      description.trim() +
      ' Built with quality materials and designed to last. Backed by our satisfaction guarantee.'
    )
  }
  return (
    base +
    ' combines thoughtful design with reliable performance. Made from quality materials, it is built to handle everyday use. Backed by our satisfaction guarantee.'
  )
}

function templateKeywords({ title, description, category }) {
  const words = ((title || '') + ' ' + (description || '') + ' ' + (category || ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
  const unique = [...new Set(words)].slice(0, 10)
  return unique.join(', ')
}

/**
 * AI Growth Assistant — analyzes the seller's business snapshot and returns
 * prioritized recommendations.
 *
 * Returns { summary, recommendations: [{ productTitle, action, why, priority, actionLink }] }
 */
export async function askGrowthAssistant({ question, snapshot, history = [] }) {
  const system =
    'You are an expert Amazon seller coach. You analyze a seller\'s business ' +
    'data and tell them exactly what to focus on. You are direct, specific, and ' +
    'prioritize by potential impact. You always respond in STRICT JSON with no ' +
    'markdown and no commentary.'

  const user =
    'Here is the seller\'s current business snapshot:\n' +
    JSON.stringify(snapshot, null, 2) +
    '\n\nSeller question: ' +
    (question || 'What should I focus on this week?') +
    '\n\nRespond with ONLY a JSON object with these keys:\n' +
    '  "summary": a 1-2 sentence headline answer\n' +
    '  "recommendations": an array of 3-5 objects, each with:\n' +
    '    "productTitle": the exact product title from the snapshot (or "Your catalog" if generic)\n' +
    '    "action": a short imperative phrase (under 60 chars)\n' +
    '    "why": one short sentence explaining the reasoning (under 140 chars)\n' +
    '    "priority": "High", "Medium", or "Low"\n' +
    '    "actionLink": the exact actionLink from the matching opportunity in the snapshot, or "/seller/growth" if none\n\n' +
    'Rules:\n' +
    '- Only reference products and actionLinks that appear in the snapshot.\n' +
    '- Prefer High-priority items first.\n' +
    '- Be specific: name the actual product.\n' +
    '- Do not invent numbers.'

  try {
    const raw = await callAI(system, user)
    const parsed = extractJson(raw)
    if (!parsed) throw new Error('Could not parse AI response')
    return {
      summary: String(parsed.summary || '').trim(),
      recommendations: (parsed.recommendations || [])
        .slice(0, 5)
        .map((r) => ({
          productTitle: String(r.productTitle || '').slice(0, 100),
          action: String(r.action || '').slice(0, 100),
          why: String(r.why || '').slice(0, 200),
          priority: ['High', 'Medium', 'Low'].includes(r.priority)
            ? r.priority
            : 'Medium',
          actionLink: String(r.actionLink || '/seller/growth'),
        })),
      aiUsed: true,
    }
  } catch (err) {
    console.warn('[growth AI] falling back:', err.message)
    return localGrowthFallback(snapshot, question)
  }
}

/**
 * Deterministic fallback — reuses the top opportunities from the snapshot.
 */
function localGrowthFallback(snapshot, question) {
  const opps = snapshot.topOpportunities || []
  const recs = opps.slice(0, 4).map((o) => ({
    productTitle: o.productTitle || 'Your catalog',
    action: o.title || 'Review this opportunity',
    why: o.description
      ? o.description.slice(0, 140)
      : 'Flagged based on your current data.',
    priority: o.impact || 'Medium',
    actionLink: o.actionLink || '/seller/growth',
  }))

  return {
    summary:
      recs.length > 0
        ? `You have ${opps.length} opportunities. Start with the highest-impact items below.`
        : 'Add a few products so I can analyze your business.',
    recommendations: recs,
    aiUsed: false,
  }
}

/* Reuse the private extractJson + callAI helpers already defined above in this file. */