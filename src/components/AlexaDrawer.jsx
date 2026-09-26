import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Maximize2, X } from 'lucide-react'
import AlexaChatPanel from './AlexaChatPanel'

export default function AlexaDrawer({ open, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  function handleExpand() {
    onClose()
    navigate('/alexa-shopping')
  }

  return (
    <div
      className={'fixed inset-0 z-50 ' + (open ? 'visible' : 'invisible pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={
          'absolute inset-0 bg-[rgba(26,26,26,0.4)] backdrop-blur-sm transition-opacity duration-base ease-avenzo-out ' +
          (open ? 'opacity-100' : 'opacity-0')
        }
      />

      <aside
        className={
          'absolute right-0 top-0 h-screen w-full sm:w-[420px] bg-bone-50 border-l border-stone-200 shadow-[-12px_0_32px_rgba(26,26,26,0.14)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
        role="dialog"
        aria-modal={open}
        aria-label="Alexa for Shopping"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex w-7 h-7 items-center justify-center rounded-full bg-brass-500/15 border border-brass-400/30">
              <Sparkles className="w-3.5 h-3.5 text-brass-600" />
            </span>
            <span className="font-display text-lg font-medium text-charcoal-900">
              Alexa for Shopping
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleExpand}
              aria-label="Expand to full page"
              title="Expand to full page"
              className="p-2 rounded-full hover:bg-stone-100 transition-avenzo"
            >
              <Maximize2 className="w-4 h-4 text-charcoal-700" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Alexa"
              title="Close"
              className="p-2 rounded-full hover:bg-stone-100 transition-avenzo"
            >
              <X className="w-4 h-4 text-charcoal-700" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <AlexaChatPanel />
        </div>
      </aside>
    </div>
  )
}
