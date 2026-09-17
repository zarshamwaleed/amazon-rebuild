import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id: 'nike',
    kicker: 'New sportswear and more',
    title: 'Stay active with Nike',
    subtitle: 'Shop the latest drops in footwear and apparel.',
    image:
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1600&q=80',
    overlay:
      'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.15) 100%)',
    to: '/category/sports-outdoors',
  },
  {
    id: 'health',
    kicker: 'Focus on your health',
    title: 'Get meds to your door',
    subtitle: 'Everyday wellness, delivered fast.',
    image:
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80',
    overlay:
      'linear-gradient(to right, rgba(0,20,40,0.85) 0%, rgba(0,20,40,0.55) 40%, rgba(0,0,0,0.15) 100%)',
    to: '/category/home-kitchen',
  },
  {
    id: 'color',
    kicker: 'The Color Edit',
    title: 'Trending styles in shades of purple',
    subtitle: 'Bold looks for the season.',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    overlay:
      'linear-gradient(to right, rgba(60,0,90,0.85) 0%, rgba(60,0,90,0.55) 40%, rgba(0,0,0,0.15) 100%)',
    to: '/category/fashion',
  },
  {
    id: 'beauty',
    kicker: 'Premium brands',
    title: 'Discover our beauty edit',
    subtitle: 'Luxury picks, curated for you.',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
    overlay:
      'linear-gradient(to right, rgba(70,30,0,0.85) 0%, rgba(70,30,0,0.55) 40%, rgba(0,0,0,0.15) 100%)',
    to: '/category/fashion',
  },
  {
    id: 'devices',
    kicker: 'Upgrade your everyday',
    title: 'Shop smart devices',
    subtitle: 'Speakers, tablets, watches, and more.',
    image:
      'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=1600&q=80',
    overlay:
      'linear-gradient(to right, rgba(80,25,0,0.85) 0%, rgba(80,25,0,0.55) 40%, rgba(0,0,0,0.15) 100%)',
    to: '/category/electronics',
  },
  {
    id: 'books',
    kicker: 'Bestsellers and classics',
    title: 'Escape into a good book',
    subtitle: 'Thousands of titles, delivered to your door.',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80',
    overlay:
      'linear-gradient(to right, rgba(10,20,60,0.85) 0%, rgba(10,20,60,0.55) 40%, rgba(0,0,0,0.15) 100%)',
    to: '/category/books',
  },
]

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Slideshow() {
  const slides = useMemo(() => shuffled(SLIDES), [])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [loaded, setLoaded] = useState({})

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [paused, slides.length])

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }
  function next() {
    setIndex((i) => (i + 1) % slides.length)
  }

  const slide = slides[index]

  return (
    <section
      className="relative rounded-lg overflow-hidden mb-6 bg-gray-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <Link
        to={slide.to}
        className="block relative min-h-[280px] md:min-h-[400px] group overflow-hidden"
      >
        {/* Background image */}
        <img
          key={slide.id + '-img'}
          src={slide.image}
          alt={slide.title}
          className={
            'absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ' +
            (loaded[slide.id] ? 'opacity-100' : 'opacity-0')
          }
          onLoad={() => setLoaded((m) => ({ ...m, [slide.id]: true }))}
          loading="eager"
        />

        {/* Strong left-to-right gradient overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: slide.overlay }}
        />

        {/* Text content */}
        <div className="relative z-10 px-6 py-10 md:px-12 md:py-16 max-w-2xl">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-wider mb-2 text-[#febd69] drop-shadow-md">
            {slide.kicker}
          </p>
          <h1
            className="text-3xl md:text-5xl font-bold leading-tight mb-3 text-white"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)' }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p
              className="text-sm md:text-lg mb-6 text-gray-100"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
            >
              {slide.subtitle}
            </p>
          )}
          <span className="inline-block bg-[#febd69] group-hover:bg-[#f3a847] text-gray-900 font-semibold px-5 py-2.5 rounded transition">
            Shop now →
          </span>
        </div>
      </Link>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-gray-900" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-gray-900" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className={
              'w-2.5 h-2.5 rounded-full transition ' +
              (i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80')
            }
            aria-label={'Go to slide ' + (i + 1)}
          />
        ))}
      </div>
    </section>
  )
}
