import { useState } from 'react'
import { Sparkles, Loader2, Minimize2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AlexaChatPanel from '../components/AlexaChatPanel'

export default function AlexaShopping() {
  const navigate = useNavigate()
  const [catalogLoading, setCatalogLoading] = useState(true)

  function handleCollapse() {
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden bg-charcoal-900 rounded-2xl px-6 py-7 md:px-9 md:py-9 mb-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-10 w-64 h-64 rounded-full bg-brass-500/20 blur-3xl"
        />
        <button
          type="button"
          onClick={handleCollapse}
          aria-label="Collapse back"
          title="Collapse"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 p-2 rounded-full bg-bone-50/10 hover:bg-bone-50/20 transition-avenzo"
        >
          <Minimize2 className="w-4 h-4 text-bone-50" />
        </button>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex w-8 h-8 items-center justify-center rounded-full bg-brass-500/15 border border-brass-400/30">
              <Sparkles className="w-3.5 h-3.5 text-brass-300" />
            </span>
            <span className="text-av-label uppercase tracking-wide font-medium text-brass-200">
              AI Shopping Assistant
            </span>
          </div>
          <h1 className="font-display font-medium text-bone-50 text-3xl md:text-display-sm leading-[1.1] tracking-tight mb-2.5">
            Alexa for Shopping
          </h1>
          <p className="text-av-body-lg text-bone-100/85 max-w-lg">
            Ask me to find products, compare options, or add items to your cart.
          </p>
          <p className="text-metadata !text-bone-300/70 mt-2 flex items-center gap-1.5">
            {catalogLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading catalog…
              </>
            ) : (
              'Powered by Groq'
            )}
          </p>
        </div>
      </div>

      {/* Chat */}
      <div className="bg-bone-50 border border-stone-200 rounded-2xl shadow-card flex flex-col h-[620px] overflow-hidden">
        <AlexaChatPanel onCatalogLoadingChange={setCatalogLoading} />
      </div>
    </div>
  )
}
