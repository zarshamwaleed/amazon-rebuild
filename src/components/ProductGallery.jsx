import { useState } from 'react'

export default function ProductGallery({ image, title }) {
  const images = [image].filter(Boolean)
  const [active, setActive] = useState(images[0])

  if (!images.length) {
    return (
      <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400">
        No image
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(src)}
              className={
                'w-14 h-14 rounded border-2 overflow-hidden ' +
                (active === src ? 'border-[#c7511f]' : 'border-gray-200 hover:border-gray-400')
              }
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 aspect-square bg-white border border-gray-200 rounded overflow-hidden flex items-center justify-center">
        <img src={active} alt={title} className="max-w-full max-h-full object-contain" />
      </div>
    </div>
  )
}
