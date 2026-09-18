export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  const systemPrompt = body.systemPrompt
  const userPrompt = body.userPrompt

  if (!systemPrompt || !userPrompt) {
    res.status(400).json({ error: 'Missing systemPrompt or userPrompt' })
    return
  }

  const key = process.env.GROQ_API_KEY
  if (!key) {
    res.status(500).json({ error: 'GROQ_API_KEY not set' })
    return
  }

  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    const data = await resp.json()

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: data?.error?.message || 'Groq request failed',
      })
    }

    const content = data?.choices?.[0]?.message?.content || ''
    res.status(200).json({ content })
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) })
  }
}