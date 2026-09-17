import { useState } from 'react'
import { Link } from 'react-router-dom'

function Tile({ image, label, to }) {
  const [errored, setErrored] = useState(false)
  return (
    <Link to={to} className="group block" aria-label={label}>
      <div className="aspect-square overflow-hidden rounded bg-gray-100 flex items-center justify-center">
        {!errored ? (
          <img
            src={image}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setErrored(true)}
          />
        ) : (
          <span className="text-xs text-gray-400 p-2 text-center">{label}</span>
        )}
      </div>
      <div className="text-xs text-gray-700 mt-1 group-hover:text-[#c7511f] group-hover:underline">
        {label}
      </div>
    </Link>
  )
}

function PrimaryImage({ image, label, to, title }) {
  const [errored, setErrored] = useState(false)
  return (
    <Link to={to} className="block mb-3 overflow-hidden rounded group" aria-label={label || title}>
      <div className="w-full h-44 md:h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {!errored ? (
          <img
            src={image}
            alt={label || title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setErrored(true)}
          />
        ) : (
          <span className="text-xs text-gray-400">{label || title}</span>
        )}
      </div>
      {label && (
        <div className="text-xs text-gray-700 mt-2 group-hover:text-[#c7511f] group-hover:underline">
          {label}
        </div>
      )}
    </Link>
  )
}

export default function CategoryCardGrid({ cards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white border border-gray-200 rounded-md p-4 flex flex-col"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
            {card.title}
          </h3>

          {card.primary && (
            <PrimaryImage
              image={card.primary.image}
              label={card.primary.label}
              to={card.primary.to}
              title={card.title}
            />
          )}

          {card.tiles?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 flex-1">
              {card.tiles.map((t) => (
                <Tile key={t.label} image={t.image} label={t.label} to={t.to} />
              ))}
            </div>
          )}

          {card.link && (
            <Link
              to={card.link.to}
              className="mt-3 text-sm text-blue-600 hover:text-[#c7511f] hover:underline"
            >
              {card.link.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
