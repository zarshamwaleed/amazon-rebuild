/**
 * AI-powered review analysis.
 * Calls /api/ai (Groq proxy from Module 7).
 * Falls back to deterministic keyword-based bucketing if the AI call fails.
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

/**
 * @param {Array} reviews - array of { rating, title, body, author_name, created_at }
 * @returns {Promise<{positiveThemes, negativeThemes, commonComplaints, customerRequests, aiUsed}>}
 */
export async function analyzeReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      positiveThemes: [],
      negativeThemes: [],
      commonComplaints: [],
      customerRequests: [],
      aiUsed: false,
    }
  }

  // Build a compact review corpus
  const corpus = reviews
    .slice(0, 40) // cap to avoid huge prompts
    .map(
      (r, i) =>
        `#${i + 1} [${r.rating}★] ${r.title || ''} — ${(r.body || '').slice(0, 200)}`
    )
    .join('\n')

  const system =
    'You are an expert e-commerce review analyst. ' +
    'You read customer reviews and extract patterns. ' +
    'You always respond in STRICT JSON with no markdown and no commentary.'

  const user =
    'Analyze these customer reviews and return ONLY a JSON object with four keys:\n' +
    '  "positiveThemes": array of 3-5 short bullet strings (what customers love)\n' +
    '  "negativeThemes": array of 3-5 short bullet strings (what customers dislike)\n' +
    '  "commonComplaints": array of 2-4 short bullet strings (specific recurring complaints)\n' +
    '  "customerRequests": array of 2-4 short bullet strings (what customers want improved or added)\n\n' +
    'Reviews:\n' +
    corpus

  try {
    const text = await callAI(system, user)
    const parsed = extractJson(text)
    if (!parsed) throw new Error('Could not parse AI response')
    return {
      positiveThemes: arr(parsed.positiveThemes).slice(0, 5),
      negativeThemes: arr(parsed.negativeThemes).slice(0, 5),
      commonComplaints: arr(parsed.commonComplaints).slice(0, 4),
      customerRequests: arr(parsed.customerRequests).slice(0, 4),
      aiUsed: true,
    }
  } catch (err) {
    console.warn('[reviewAIService] falling back to local analysis:', err.message)
    const fallback = localAnalysis(reviews)
    return { ...fallback, aiUsed: false }
  }
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

function arr(v) {
  if (!Array.isArray(v)) return []
  return v.map((x) => String(x).trim()).filter(Boolean)
}

/* Deterministic fallback */

function localAnalysis(reviews) {
  const positives = []
  const negatives = []
  const complaints = []
  const requests = []

  const positiveWords = ['great', 'good', 'excellent', 'love', 'amazing', 'perfect', 'quality', 'recommend', 'comfortable', 'fast']
  const negativeWords = ['bad', 'poor', 'terrible', 'broken', 'damaged', 'slow', 'disappoint', 'cheap', 'returned', 'refund']
  const complaintWords = ['packaging', 'shipping', 'battery', 'sound', 'size', 'fit', 'late']
  const requestWords = ['wish', 'should', 'could be', 'hope', 'need', 'want']

  for (const r of reviews) {
    const text = ((r.title || '') + ' ' + (r.body || '')).toLowerCase()
    const star = Number(r.rating)
    if (star >= 4) {
      for (const w of positiveWords) {
        if (text.includes(w)) {
          positives.push(`${cap(w)} quality noted in reviews`)
          break
        }
      }
    }
    if (star <= 2) {
      for (const w of negativeWords) {
        if (text.includes(w)) {
          negatives.push(`Frequent mentions of "${w}"`)
          break
        }
      }
    }
    for (const w of complaintWords) {
      if (text.includes(w)) {
        complaints.push(`${cap(w)}-related complaints`)
        break
      }
    }
    for (const w of requestWords) {
      if (text.includes(w)) {
        requests.push(`Customers request improvements around "${w}"`)
        break
      }
    }
  }

  return {
    positiveThemes: [...new Set(positives)].slice(0, 5).length
      ? [...new Set(positives)].slice(0, 5)
      : ['Overall positive sentiment across 4★ and 5★ reviews'],
    negativeThemes: [...new Set(negatives)].slice(0, 5),
    commonComplaints: [...new Set(complaints)].slice(0, 4),
    customerRequests: [...new Set(requests)].slice(0, 4),
    aiUsed: false,
  }
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}