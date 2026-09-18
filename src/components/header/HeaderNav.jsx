import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

const ITEMS = [
  { label: 'Alexa for Shopping', to: '/alexa-shopping' },
  { label: 'Prime Video', to: '/prime-video' },
  { label: "Zarsham's Amazon.com", to: '/account' },
  { label: 'Coupons', to: '/coupons' },
  { label: 'Customer Service', to: '/customer-service' },
  { label: 'Browsing History', to: '/browsing-history' },
  { label: "Today's Deals", to: '/deals' },
  { label: 'Registry', to: '/registry' },
  { label: 'Buy Again', to: '/buy-again' },
  { label: 'Gift Cards', to: '/gift-cards' },
  { label: 'Sell', to: '/sell' },
]

export default function HeaderNav({ onOpenAll }) {
  const { pathname } = useLocation()

  return (
    <nav className="bg-[#232f3e] text-white text-sm">
      <div className="max-w-[1500px] mx-auto flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={onOpenAll}
          className="flex items-center gap-1 px-3 py-1.5 border border-transparent hover:border-white rounded whitespace-nowrap font-bold"
        >
          <Menu className="w-4 h-4" />
          All
        </button>

        {ITEMS.map((item) => {
          const active = pathname === item.to
          return (
            <Link
              key={item.label}
              to={item.to}
              className={
                'px-2.5 py-1.5 border rounded whitespace-nowrap transition ' +
                (active
                  ? 'border-white bg-white/5'
                  : 'border-transparent hover:border-white')
              }
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
