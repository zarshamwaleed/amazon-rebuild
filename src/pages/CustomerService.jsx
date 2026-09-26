import { Link } from 'react-router-dom'
import { Package, RefreshCw, CreditCard, MessageCircle, MapPin, Lock, ChevronRight } from 'lucide-react'
import Card from '../components/Card'

const TOPICS = [
  { icon: Package, title: 'Track your package', text: 'View order status and delivery progress.', to: '/orders' },
  { icon: RefreshCw, title: 'Returns & replacements', text: 'Start a return or exchange.', to: '/orders' },
  { icon: CreditCard, title: 'Payment & pricing', text: 'Manage payment methods and promo codes.', to: '/account' },
  { icon: MapPin, title: 'Addresses', text: 'Add or update your shipping addresses.', to: '/account' },
  { icon: Lock, title: 'Account & security', text: 'Update your password and account details.', to: '/account' },
  { icon: MessageCircle, title: 'Contact us', text: 'Chat with a support agent (demo).', to: '/customer-service' },
]

const FAQS = [
  {
    q: 'Where is my order?',
    a: (
      <>
        Track your order from <Link to="/orders" className="text-brass-700 hover:underline">Your Orders</Link>.
      </>
    ),
  },
  {
    q: 'How do I return an item?',
    a: 'Open the order, choose the item, and select "Return or replace". Returns are free within 30 days.',
  },
  {
    q: 'How do I change my shipping address?',
    a: (
      <>
        Go to <Link to="/account" className="text-brass-700 hover:underline">Your Account</Link> or add a new
        address during checkout.
      </>
    ),
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. Payments in Amazon Rebuild are simulated; no real card data is collected or stored.',
  },
]

export default function CustomerService() {
  return (
    <div>
      <nav className="text-caption mb-4">
        <Link to="/" className="hover:text-charcoal-700 hover:underline">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-charcoal-700">Customer Service</span>
      </nav>

      <div className="bg-charcoal-900 text-bone-50 rounded-xl p-6 md:p-10 mb-8 md:mb-10">
        <h1 className="font-display text-display-sm md:text-display text-bone-50 mb-2">
          Hello, how can we help?
        </h1>
        <p className="text-body-lg text-stone-300">
          Find answers to common questions or get in touch with our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {TOPICS.map((t) => {
          const Icon = t.icon
          return (
            <Link key={t.title} to={t.to} className="block">
              <Card hoverable className="h-full">
                <Icon className="w-6 h-6 text-brass-600 mb-3" strokeWidth={1.75} />
                <h2 className="heading-sub mb-1">{t.title}</h2>
                <p className="text-body-sm">{t.text}</p>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 md:mt-10">
        <Card title="Frequently asked questions">
          <dl className="divide-y divide-stone-200">
            {FAQS.map((f) => (
              <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                <dt className="flex items-center gap-1.5 font-medium text-charcoal-900">
                  <ChevronRight className="w-3.5 h-3.5 text-brass-500 shrink-0" />
                  {f.q}
                </dt>
                <dd className="text-body-sm mt-1.5 pl-5">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  )
}
