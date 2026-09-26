import { Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export default function AlexaFloatingButton({ onOpen, hidden }) {
  const { pathname } = useLocation()

  if (pathname === '/alexa-shopping') return null
  if (pathname.startsWith('/seller') || pathname.startsWith('/sell')) return null
  if (hidden) return null

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open Alexa for Shopping assistant"
      title="Ask Alexa"
      className="fixed z-40 flex items-center justify-center rounded-full bottom-4 right-4 w-12 h-12 sm:bottom-6 sm:right-6 sm:w-14 sm:h-14 bg-[#1A1A1A] border border-[rgba(184,149,106,0.3)] shadow-[0_8px_24px_rgba(26,26,26,0.18)] transition-avenzo hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(26,26,26,0.24)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2"
    >
      <Sparkles size={22} color="#F5F2ED" />
    </button>
  )
}
