export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { systemPrompt, userPrompt } = body || {}
  if (!systemPrompt || !userPrompt) {
    return new Response(JSON.stringify({ error: 'Missing systemPrompt or userPrompt' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const key = process.env.GROQ_API_KEY
  if (!key) {
    return new Response(
      JSON.stringify({ error: 'GROQ_API_KEY not configured on the server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
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
      return new Response(JSON.stringify({ error: data?.error?.message || 'Groq request failed' }), {
        status: r.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const content = data?.choices?.[0]?.message?.content || ''
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}