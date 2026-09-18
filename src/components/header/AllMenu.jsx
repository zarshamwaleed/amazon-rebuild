import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Digital Content & Devices',
    links: [
      { label: 'Amazon Music', to: '/prime-video' },
      { label: 'Kindle E-readers & Books', to: '/category/books' },
      { label: 'Amazon Appstore', to: '/category/electronics' },
      { label: 'Prime Video', to: '/prime-video' },
      { label: 'Alexa', to: '/alexa-shopping' },
    ],
  },
  {
    title: 'Shop by Department',
    links: [
      { label: 'Electronics', to: '/category/electronics' },
      { label: 'Computers', to: '/category/electronics' },
      { label: 'Home & Kitchen', to: '/category/home-kitchen' },
      { label: 'Books', to: '/category/books' },
      { label: 'Fashion', to: '/category/fashion' },
      { label: 'Toys & Games', to: '/category/toys-games' },
      { label: 'Sports & Outdoors', to: '/category/sports-outdoors' },
    ],
  },
  {
    title: 'Help & Settings',
    links: [
      { label: 'Your Account', to: '/account' },
      { label: 'Customer Service', to: '/customer-service' },
      { label: 'Sign In', to: '/login' },
    ],
  },
]

export default function AllMenu({ open, onClose }) {
  return (
    <div
      className={
        'fixed inset-0 z-[60] transition ' + (open ? 'visible' : 'invisible')
      }
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={
          'absolute inset-0 bg-black transition-opacity duration-300 ' +
          (open ? 'opacity-60' : 'opacity-0')
        }
      />

      {/* Drawer */}
      <aside
        className={
          'relative bg-white w-80 max-w-[85vw] h-full shadow-2xl flex flex-col transition-transform duration-300 ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
        aria-label="All departments menu"
      >
        <div className="bg-[#232f3e] text-white flex items-center gap-3 px-5 py-4">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="hover:bg-white/10 rounded p-1"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold">Hello, sign in</span>
        </div>

        <nav className="overflow-y-auto py-4 flex-1">
          {SECTIONS.map((s) => (
            <div key={s.title} className="mb-4">
              <h3 className="px-5 py-2 text-base font-bold text-gray-900">{s.title}</h3>
              <ul>
                {s.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      onClick={onClose}
                      className="block px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  )
}
