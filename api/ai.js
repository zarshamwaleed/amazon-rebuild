export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { systemPrompt, userPrompt } = req.body || {}
  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: 'Missing systemPrompt or userPrompt' })
  }

  const key = process.env.GROQ_API_KEY
  if (!key) {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not set. Add it to .env.local',
    })
  }

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + key,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    const data = await r.json()

    if (!r.ok) {
      const msg =
        data?.error?.message ||
        (typeof data?.error === 'string' ? data.error : 'Groq request failed')
      return res.status(r.status).json({ error: msg })
    }

    const content = data?.choices?.[0]?.message?.content || ''
    return res.status(200).json({ content })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}