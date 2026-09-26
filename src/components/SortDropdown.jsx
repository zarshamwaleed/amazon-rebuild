import { useEffect, useRef, useState } from 'react'
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react'

const OPTIONS = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Avg. Customer Review' },
]

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const active = OPTIONS.find((o) => o.value === value) || OPTIONS[0]

  useEffect(() => {
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={rootRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          'flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-lg border text-av-body-sm font-medium transition-avenzo ' +
          (open ? 'border-stone-400 bg-bone-50' : 'border-stone-300 bg-bone-50 hover:border-stone-400')
        }
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
        <span className="text-charcoal-800 whitespace-nowrap">{active.label}</span>
        <ChevronDown
          className={'w-3.5 h-3.5 text-charcoal-400 transition-transform duration-base flex-shrink-0 ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-56 z-30 animate-scale-in origin-top-right"
        >
          <div className="bg-bone-50 border border-stone-200 rounded-xl shadow-popover overflow-hidden py-1.5">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={
                  'w-full flex items-center justify-between gap-3 px-4 py-2.5 text-av-body-sm text-left transition-avenzo ' +
                  (o.value === value
                    ? 'text-charcoal-900 font-medium bg-stone-50'
                    : 'text-charcoal-600 hover:bg-stone-50 hover:text-charcoal-900')
                }
              >
                {o.label}
                {o.value === value && <Check className="w-3.5 h-3.5 text-brass-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
