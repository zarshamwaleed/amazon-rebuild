import { Link, NavLink } from 'react-router-dom'

const NAV = [
  { label: 'Sell on Amazon', to: '/sell', end: true },
  { label: 'Pricing', to: '/sell#pricing' },
  { label: 'How it works', to: '/sell#how-it-works' },
  { label: 'Resources', to: '/sell#resources' },
]

export default function SellHeader() {
  return (
    <header className="bg-[#131921] text-white sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto flex items-center gap-6 px-4 py-3">
        <Link to="/sell" className="flex items-center flex-shrink-0">
          <span className="text-white text-xl font-bold">amazon</span>
          <span className="text-[#ff9900] text-xl font-bold">seller</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.to}
              className="px-3 py-2 text-sm text-gray-200 hover:text-white rounded transition"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/login"
            className="text-sm text-white px-3 py-2 hover:underline"
          >
            Sign in
          </Link>
          <Link
            to="/sell/register"
            className="text-sm font-medium bg-[#febd69] hover:bg-[#f3a847] text-gray-900 px-4 py-2 rounded transition"
          >
            Start Selling
          </Link>
        </div>
      </div>
    </header>
  )
}
