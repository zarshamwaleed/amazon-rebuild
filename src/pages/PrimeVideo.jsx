import { Play } from 'lucide-react'
import { Link } from 'react-router-dom'

const TRENDING = [
  { title: 'The Midnight Hour', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80' },
  { title: 'Neon City', image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=80' },
  { title: 'Quiet Waters', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80' },
  { title: 'Beyond the Ridge', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80' },
]

const ORIGINALS = [
  { title: 'Rebuild', image: 'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?w=400&q=80' },
  { title: 'Signal Lost', image: 'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?w=400&q=80' },
  { title: 'Paper Kingdom', image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=400&q=80' },
  { title: 'Northbound', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80' },
]

export default function PrimeVideo() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#0f171e] to-[#1a242f] text-white rounded-lg p-8 md:p-14">
        <p className="text-[#00a8e1] text-sm font-semibold uppercase tracking-wider mb-2">
          Prime Video
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Featured this week</h1>
        <p className="text-gray-300 mb-6 max-w-xl">
          Movies, series, and Amazon Originals. Watch on any device. (Demo — no real streaming.)
        </p>
        <button className="bg-white text-gray-900 font-semibold px-5 py-2.5 rounded flex items-center gap-2">
          <Play className="w-4 h-4" /> Watch now
        </button>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Trending</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRENDING.map((m) => (
            <div key={m.title} className="group cursor-pointer">
              <div className="aspect-video rounded overflow-hidden bg-gray-200">
                <img
                  src={m.image}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="text-sm font-medium text-gray-900 mt-2">{m.title}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Amazon Originals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ORIGINALS.map((m) => (
            <div key={m.title} className="group cursor-pointer">
              <div className="aspect-video rounded overflow-hidden bg-gray-200">
                <img
                  src={m.image}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="text-sm font-medium text-gray-900 mt-2">{m.title}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
