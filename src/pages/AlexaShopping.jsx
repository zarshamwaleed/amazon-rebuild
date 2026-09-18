import { useState } from 'react'
import { Mic, Send } from 'lucide-react'

const SUGGESTIONS = [
  'Find me a laptop under $800',
  "What's good for a home office?",
  'Compare wireless headphones',
  'Best rated books this year',
]

export default function AlexaShopping() {
  const [q, setQ] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm Alexa for Shopping. Ask me anything — I can search products, compare options, and help you decide.",
    },
  ])

  function send(text) {
    const query = (text ?? q).trim()
    if (!query) return
    setMessages((m) => [
      ...m,
      { role: 'user', text: query },
      {
        role: 'assistant',
        text: `Demo response: I would search for "${query}" and recommend matching products. Try the search bar at the top for real results.`,
      },
    ])
    setQ('')
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white rounded-lg p-6 md:p-10 mb-6">
        <h1 className="text-3xl font-bold mb-2">Alexa for Shopping</h1>
        <p className="text-gray-200">
          Your AI-powered shopping assistant. Ask questions, compare products, get recommendations.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-5">
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                'text-sm p-3 rounded-md ' +
                (m.role === 'user' ? 'bg-gray-100 text-gray-900' : 'bg-blue-50 text-gray-800')
              }
            >
              <div className="font-semibold text-xs uppercase tracking-wider mb-1 text-gray-500">
                {m.role === 'user' ? 'You' : 'Alexa'}
              </div>
              {m.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask Alexa anything about shopping…"
            className="flex-1 text-sm focus:outline-none"
          />
          <button
            onClick={() => send()}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
          <button className="text-gray-500 hover:text-gray-800" aria-label="Voice input">
            <Mic className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs border border-gray-300 hover:bg-gray-50 rounded-full px-3 py-1.5"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
