import { useLocation } from 'react-router-dom'
import { Trophy, Radio, Sparkles, LayoutGrid } from 'lucide-react'

const CONFIG = {
  '/prime-video/sports': {
    title: 'Sports',
    icon: Trophy,
    description: 'Live matches, highlights, and studio shows.',
    blurb: 'Demo page — live sports streaming requires licensed content. This shows the layout.',
    sections: ['Live Now', 'Upcoming', 'Popular Sports'],
  },
  '/prime-video/live': {
    title: 'Live TV',
    icon: Radio,
    description: 'Channels streaming right now, plus what’s on next.',
    blurb: 'Demo page — live channels would be provided by content partners.',
    sections: ['On Now', 'Up Next', 'Recommended Channels'],
  },
  '/prime-video/subscriptions': {
    title: 'Subscriptions',
    icon: Sparkles,
    description: 'Add premium channels to your Prime Video subscription.',
    blurb: 'Demo page — subscriptions are illustrative only.',
    sections: ['Explore Channels', 'Popular', 'Bundles'],
  },
  '/prime-video/categories': {
    title: 'Categories',
    icon: LayoutGrid,
    description: 'Browse by genre, mood, or collection.',
    blurb: 'Demo page — full category taxonomy is illustrative.',
    sections: ['Action', 'Drama', 'Sci-Fi', 'Documentary', 'Kids', 'Anime'],
  },
}

export default function PVSimple() {
  const { pathname } = useLocation()
  const cfg = CONFIG[pathname] || {
    title: 'Prime Video',
    icon: LayoutGrid,
    description: '',
    blurb: '',
    sections: [],
  }
  const Icon = cfg.icon

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-4">
        <span className="w-14 h-14 rounded-full bg-[#00A8E1]/20 flex items-center justify-center">
          <Icon className="w-7 h-7 text-[#00A8E1]" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-white">{cfg.title}</h1>
          <p className="text-gray-400 text-sm">{cfg.description}</p>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-8 max-w-2xl">{cfg.blurb}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cfg.sections.map((s) => (
          <div
            key={s}
            className="bg-[#1B2733] border border-white/5 rounded-md p-5 aspect-video flex items-center justify-center"
          >
            <span className="text-sm text-gray-400">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
