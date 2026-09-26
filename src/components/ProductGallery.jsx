import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

/**
 * Immersive product image gallery: large hero with cursor-follow zoom,
 * a thumbnail strip (vertical on desktop, horizontal on mobile), a
 * fullscreen lightbox for a closer look, and crossfade transitions
 * between images. Renders gracefully for a single image (the common
 * case today) and scales up automatically once a product has more.
 */
export default function ProductGallery({ images = [], title }) {
  const list = images.filter(Boolean)
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [lightbox, setLightbox] = useState(false)
  const frameRef = useRef(null)

  if (!list.length) {
    return (
      <div className="aspect-square bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center text-caption">
        No image
      </div>
    )
  }

  function go(delta) {
    setActive((i) => (i + delta + list.length) % list.length)
  }

  function handleMouseMove(e) {
    const rect = frameRef.current.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        {list.length > 1 && (
          <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
            {list.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1} of ${list.length}`}
                aria-current={active === i}
                className={
                  'aspect-square rounded-lg overflow-hidden border-2 transition-avenzo ' +
                  (active === i
                    ? 'border-charcoal-900'
                    : 'border-stone-200 hover:border-stone-400')
                }
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div
          ref={frameRef}
          className="group relative flex-1 aspect-square bg-bone-50 border border-stone-200 rounded-xl overflow-hidden cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onClick={() => setLightbox(true)}
        >
          {list.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt={i === 0 ? title : `${title} — view ${i + 1}`}
              className={
                'absolute inset-0 w-full h-full object-contain transition-opacity duration-slow ease-avenzo-out ' +
                (i === active ? 'opacity-100' : 'opacity-0 pointer-events-none')
              }
              style={
                i === active && zoomed
                  ? {
                      transform: 'scale(1.8)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transitionProperty: 'opacity',
                    }
                  : undefined
              }
            />
          ))}

          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-charcoal-900/80 text-bone-50 text-av-caption px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-avenzo pointer-events-none">
            <ZoomIn className="w-3 h-3" /> Zoom
          </div>

          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(-1)
                }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-bone-50/90 shadow-soft flex items-center justify-center opacity-0 group-hover:opacity-100 transition-avenzo hover:bg-bone-50"
              >
                <ChevronLeft className="w-4 h-4 text-charcoal-800" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(1)
                }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-bone-50/90 shadow-soft flex items-center justify-center opacity-0 group-hover:opacity-100 transition-avenzo hover:bg-bone-50"
              >
                <ChevronRight className="w-4 h-4 text-charcoal-800" />
              </button>
            </>
          )}
        </div>
      </div>

      {list.length > 1 && (
        <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar pb-1">
          {list.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${list.length}`}
              aria-current={active === i}
              className={
                'w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-avenzo ' +
                (active === i ? 'border-charcoal-900' : 'border-stone-200')
              }
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-900/95 flex items-center justify-center p-4 sm:p-10 animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-bone-50/10 hover:bg-bone-50/20 flex items-center justify-center text-bone-50 transition-avenzo"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={list[active]}
            alt={title}
            className="max-w-full max-h-full object-contain animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(-1)
                }}
                aria-label="Previous image"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-bone-50/10 hover:bg-bone-50/20 flex items-center justify-center text-bone-50 transition-avenzo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(1)
                }}
                aria-label="Next image"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-bone-50/10 hover:bg-bone-50/20 flex items-center justify-center text-bone-50 transition-avenzo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
