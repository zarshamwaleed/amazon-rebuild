import { Link } from 'react-router-dom'
import { Globe } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Get to Know Us',
    links: [
      { label: 'Careers', to: '/careers' },
      { label: 'Blog', to: '/about' },
      { label: 'About Amazon Rebuild', to: '/about' },
      { label: 'Sustainability', to: '/sustainability' },
      { label: 'Press Center', to: '/press' },
      { label: 'Investor Relations', to: '/investor-relations' },
      { label: 'Accessibility', to: '/accessibility' },
    ],
  },
  {
    title: 'Make Money with Us',
    links: [
      { label: 'Sell on Amazon Rebuild', to: '/about' },
      { label: 'Become an Affiliate', to: '/about' },
      { label: 'Advertise Your Products', to: '/about' },
      { label: 'Self-Publish With Us', to: '/about' },
      { label: 'See More Ways to Make Money', to: '/about' },
    ],
  },
  {
    title: 'Payment Products',
    links: [
      { label: 'Amazon Rebuild Card', to: '/about' },
      { label: 'Store Card', to: '/about' },
      { label: 'Business Card', to: '/about' },
      { label: 'Shop with Points', to: '/about' },
      { label: 'Reload Your Balance', to: '/about' },
      { label: 'Gift Cards', to: '/gift-cards' },
      { label: 'Currency Converter', to: '/about' },
    ],
  },
  {
    title: 'Let Us Help You',
    links: [
      { label: 'Your Account', to: '/account' },
      { label: 'Your Orders', to: '/orders' },
      { label: 'Shipping Rates & Policies', to: '/customer-service' },
      { label: 'Returns & Replacements', to: '/customer-service' },
      { label: 'Manage Your Content and Devices', to: '/account' },
      { label: 'Registry & Gift List', to: '/registry' },
      { label: 'Customer Service', to: '/customer-service' },
      { label: 'Help', to: '/customer-service' },
    ],
  },
]

const SUB_LINKS = [
  { label: 'Amazon Music', to: '/about' },
  { label: 'Amazon Ads', to: '/about' },
  { label: '6pm', to: '/about' },
  { label: 'AbeBooks', to: '/about' },
  { label: 'ACX', to: '/about' },
  { label: 'Sell on Amazon', to: '/about' },
  { label: 'Veeqo', to: '/about' },
  { label: 'Amazon Business', to: '/about' },
  { label: 'AmazonGlobal', to: '/about' },
  { label: 'Home Services', to: '/about' },
  { label: 'Amazon Web Services', to: '/about' },
  { label: 'Audible', to: '/about' },
  { label: 'Box Office Mojo', to: '/about' },
  { label: 'Goodreads', to: '/about' },
  { label: 'IMDb', to: '/about' },
  { label: 'IMDbPro', to: '/about' },
  { label: 'Kindle Direct Publishing', to: '/about' },
  { label: 'Prime Video Direct', to: '/about' },
  { label: 'Shopbop', to: '/about' },
  { label: 'Amazon Resale', to: '/about' },
  { label: 'Whole Foods Market', to: '/about' },
  { label: 'Woot!', to: '/about' },
  { label: 'Zappos', to: '/about' },
  { label: 'Ring', to: '/about' },
  { label: 'eero WiFi', to: '/about' },
  { label: 'Blink', to: '/about' },
  { label: 'Neighbors App', to: '/about' },
  { label: 'PillPack', to: '/about' },
]

export default function Footer() {
  return (
    <footer className="bg-[#232f3e] text-white mt-10">
      {/* Back to top */}
      <a
        href="#main-content"
        className="block bg-[#37475a] hover:bg-[#485769] text-center py-3 text-sm transition"
      >
        Back to top
      </a>

      {/* Main columns */}
      <div className="max-w-[1500px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-10 text-sm">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-bold mb-3 text-white">{col.title}</h4>
            <ul className="space-y-2 text-gray-300">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600" />

      {/* Logo + locale */}
      <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 py-6">
        <Link to="/" className="text-white text-xl font-bold">
          amazon<span className="text-[#ff9900]">.rebuild</span>
        </Link>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-500 hover:border-white rounded px-3 py-1.5 text-sm">
            <Globe className="w-4 h-4" />
            English
          </button>
          <button className="flex items-center gap-2 border border-gray-500 hover:border-white rounded px-3 py-1.5 text-sm">
            🇵🇰 Pakistan
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600" />

      {/* Sub-brand grid */}
      <div className="max-w-[1500px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-3 text-xs">
          {SUB_LINKS.map((s) => (
            <Link key={s.label} to={s.to} className="text-gray-400 hover:text-white hover:underline">
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-600">
        <div className="max-w-[1500px] mx-auto flex flex-wrap justify-center gap-x-6 gap-y-2 py-4 text-xs text-gray-300">
          <Link to="/about" className="hover:underline">Conditions of Use</Link>
          <Link to="/about" className="hover:underline">Privacy Notice</Link>
          <Link to="/about" className="hover:underline">Consumer Health Data Privacy Disclosure</Link>
          <Link to="/about" className="hover:underline">Your Ads Privacy Choices</Link>
        </div>
        <div className="pb-6 text-center text-xs text-gray-400">
          © 2026 Amazon Rebuild — a student project. Not affiliated with Amazon.com, Inc.
        </div>
      </div>
    </footer>
  )
}
