import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import useCategories from '../hooks/useCategories'

const GROUPS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/products' },
      { label: "Today's Deals", to: '/deals' },
      { label: 'Gift Cards', to: '/gift-cards' },
      { label: 'Registry', to: '/registry' },
      { label: 'Coupons', to: '/coupons' },
    ],
  },
  {
    title: 'Your Account',
    links: [
      { label: 'Your Account', to: '/account' },
      { label: 'Your Orders', to: '/orders' },
      { label: 'Your Wishlist', to: '/wishlist' },
      { label: 'Buy Again', to: '/buy-again' },
      { label: 'Browsing History', to: '/browsing-history' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
      { label: 'Investor Relations', to: '/investor-relations' },
      { label: 'Sustainability', to: '/sustainability' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Customer Service', to: '/customer-service' },
      { label: 'Alexa for Shopping', to: '/alexa-shopping' },
      { label: 'Accessibility', to: '/accessibility' },
      { label: 'Sell on Avenzo', to: '/sell' },
    ],
  },
]

export default function Footer() {
  const { categories } = useCategories()

  return (
    <footer className="bg-bone-100 border-t border-stone-200 mt-16">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full flex items-center justify-center gap-2 py-3 text-av-label uppercase tracking-wide text-charcoal-600 hover:text-charcoal-900 hover:bg-stone-100 transition-avenzo"
      >
        <ArrowUp className="w-3.5 h-3.5" />
        Back to top
      </button>

      <div className="max-w-[1500px] mx-auto px-6 sm:px-8 py-14">
        <div className="mb-10">
          <span className="font-display text-2xl font-medium text-charcoal-900">Avenzo</span>
          <p className="text-body-sm mt-2 max-w-sm">
            Thoughtfully curated goods for a considered life.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-10">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-label mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="link-underline-brass inline-block text-body-sm hover:text-charcoal-900 transition-avenzo"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {categories.length > 0 && (
            <div>
              <h4 className="text-label mb-4">Categories</h4>
              <ul className="space-y-2.5">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={'/category/' + cat.slug}
                      className="link-underline-brass inline-block text-body-sm hover:text-charcoal-900 transition-avenzo"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-stone-200 py-5">
        <p className="text-center text-caption">
          © {new Date().getFullYear()} Avenzo — a student project. Not affiliated with Amazon.
        </p>
      </div>
    </footer>
  )
}
