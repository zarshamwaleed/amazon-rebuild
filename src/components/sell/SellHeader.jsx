import { Link } from 'react-router-dom'

const NAV = [
  { label: 'How it works', to: '/sell#how-it-works' },
  { label: 'Pricing', to: '/sell#pricing' },
  { label: 'Resources', to: '/sell#resources' },
]

export default function SellHeader() {
  return (
    <header className="sticky top-0 z-40 bg-bone-50/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-[1400px] mx-auto flex items-center gap-6 px-4 sm:px-6 py-3.5">
        <Link to="/sell" className="group flex items-baseline gap-2 flex-shrink-0">
          <span className="font-display text-xl leading-none font-medium tracking-tight text-charcoal-900 group-hover:text-brass-700 transition-avenzo">
            Avenzo
          </span>
          <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.1em] text-charcoal-400 border-l border-stone-300 pl-2">
            Sell
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.to}
              className="px-3 py-2 text-sm text-charcoal-600 hover:text-charcoal-900 rounded-lg hover:bg-stone-100 transition-avenzo"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/login"
            className="text-sm font-medium text-charcoal-700 hover:text-charcoal-900 px-3 py-2 transition-avenzo"
          >
            Sign in
          </Link>
          <Link
            to="/sell/register"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium bg-charcoal-900 text-bone-50 hover:bg-charcoal-800 active:bg-charcoal-700 active:scale-[0.98] transition-avenzo"
          >
            Start selling
          </Link>
        </div>
      </div>
    </header>
  )
}
