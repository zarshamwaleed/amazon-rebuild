import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Package,
  DollarSign,
  Truck,
  BarChart3,
  Users,
  Star,
  Check,
  ChevronDown,
  ArrowRight,
} from 'lucide-react'

const HOW_IT_WORKS = [
  { n: '01', title: 'Get ready to sell', desc: 'Create your seller account and set up your business profile.' },
  { n: '02', title: 'List products', desc: 'Add products to the marketplace individually or in bulk.' },
  { n: '03', title: 'Price products', desc: 'Set competitive prices and use automated pricing rules.' },
  { n: '04', title: 'Select fulfillment', desc: 'Choose between FBA or FBM to ship to your customers.' },
  { n: '05', title: 'Promote and advertise', desc: 'Run coupons, deals, and Sponsored Product campaigns.' },
  { n: '06', title: 'Get product reviews', desc: 'Build customer trust and grow repeat purchases.' },
]

const WHY_SELL = [
  { icon: Users, title: 'Reach customers', desc: 'Put your products in front of shoppers who are already buying.' },
  { icon: BarChart3, title: 'Manage your business', desc: 'Tools for inventory, orders, and pricing — all in one place.' },
  { icon: Truck, title: 'Flexible fulfillment', desc: 'Choose how orders are stored, packed, and shipped.' },
  { icon: Star, title: 'Grow your brand', desc: 'Build a brand presence and reach repeat customers.' },
]

const FAQS = [
  {
    q: 'How much does it cost to sell on Amazon Rebuild?',
    a: 'Individual sellers pay $0.99 per item sold. Professional sellers pay $39.99 per month with no per-item fee. You can switch plans at any time.',
  },
  {
    q: 'Do I need a registered business to sell?',
    a: 'No. Individual sellers can list products without a registered business. Professional sellers benefit from bulk tools and advertising.',
  },
  {
    q: 'How do I get paid?',
    a: 'Payouts are processed every 14 days and deposited directly into your bank account. In this demo, payouts are simulated.',
  },
  {
    q: 'What can I sell?',
    a: 'Almost anything that is legal and follows our category guidelines. Some categories require additional approval.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. All verification in this demo is simulated — we do not collect real ID documents, bank statements, or card details.',
  },
]

export default function SellLanding() {
  const [price, setPrice] = useState(49.99)
  const [cost, setCost] = useState(20.0)
  const [shipping, setShipping] = useState(5.0)
  const [fees, setFees] = useState(7.5)
  const [openFaq, setOpenFaq] = useState(null)

  const profit = Math.max(0, (Number(price) || 0) - (Number(cost) || 0) - (Number(shipping) || 0) - (Number(fees) || 0))
  const margin = Number(price) > 0 ? (profit / Number(price)) * 100 : 0

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#232f3e] to-[#131921] text-white">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-10 items-center px-4 py-16 md:py-24">
          <div>
            <p className="text-[#febd69] text-sm font-bold uppercase tracking-widest mb-3">
              Sell on Amazon Rebuild
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Reach millions of customers and grow your business.
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Start selling in minutes. Manage your catalog, orders, and payments from one Seller Central dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/sell/register"
                className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-semibold px-6 py-3 rounded transition flex items-center gap-2"
              >
                Start Selling <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="border border-white hover:bg-white hover:text-gray-900 text-white font-semibold px-6 py-3 rounded transition"
              >
                Learn More
              </a>
            </div>
            <div className="mt-6 flex items-center gap-6 text-xs text-gray-400">
              <span>✓ No setup fee</span>
              <span>✓ Cancel anytime</span>
              <span>✓ Demo environment</span>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-[#37475a] to-[#232f3e] rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80"
                alt="Seller working with products"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">How selling works</h2>
          <p className="text-gray-600 mb-10">Six simple stages from sign-up to your first sale.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((s) => (
              <div
                key={s.n}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="text-[#c7511f] text-2xl font-bold mb-3">{s.n}</div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SELL */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Why sell with us?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_SELL.map((w) => {
              const Icon = w.icon
              return (
                <div key={w.title} className="bg-white rounded-lg p-6 border border-gray-200">
                  <Icon className="w-8 h-8 text-[#c7511f] mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">{w.title}</h3>
                  <p className="text-sm text-gray-600">{w.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SELLING PLANS */}
      <section id="pricing" className="bg-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose a selling plan</h2>
          <p className="text-gray-600 mb-10">Start free. Upgrade when you're ready to scale.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="border border-gray-200 rounded-lg p-8 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Individual</h3>
              <div className="my-4">
                <span className="text-4xl font-bold text-gray-900">$0.99</span>
                <span className="text-gray-600 ml-2">per item sold</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">Good for occasional sellers.</p>
              <ul className="space-y-2 mb-8 text-sm text-gray-700">
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> List products</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Manage orders</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Manage inventory</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Basic seller tools</li>
              </ul>
              <Link
                to="/sell/register?plan=individual"
                className="mt-auto block text-center border border-gray-900 text-gray-900 font-medium py-3 rounded hover:bg-gray-900 hover:text-white transition"
              >
                Choose Individual
              </Link>
            </div>

            <div className="border-2 border-[#febd69] rounded-lg p-8 flex flex-col relative">
              <span className="absolute -top-3 left-8 bg-[#febd69] text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Professional</h3>
              <div className="my-4">
                <span className="text-4xl font-bold text-gray-900">$39.99</span>
                <span className="text-gray-600 ml-2">per month</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">For growing businesses.</p>
              <ul className="space-y-2 mb-8 text-sm text-gray-700">
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Bulk listing</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Advanced reports</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Advertising</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Automate Pricing</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> Advanced seller tools</li>
              </ul>
              <Link
                to="/sell/register?plan=professional"
                className="mt-auto block text-center bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium py-3 rounded transition"
              >
                Choose Professional
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FULFILLMENT */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose how you fulfill orders</h2>
          <p className="text-gray-600 mb-10">
            Fulfillment by Amazon handles storage, packing, and shipping. Or ship products yourself.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <Package className="w-10 h-10 text-[#c7511f] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fulfillment by Amazon (FBA)</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Amazon stores, picks, packs, and ships your products. We also handle customer service and returns.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-gray-700">
                <li>✓ Amazon handles storage and shipping</li>
                <li>✓ Products become Prime eligible</li>
                <li>✓ Faster delivery to customers</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <Truck className="w-10 h-10 text-[#c7511f] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fulfilled by Merchant (FBM)</h3>
              <p className="text-gray-600 mb-6 text-sm">
                You store, pack, and ship your products yourself. Complete control over fulfillment and packaging.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-gray-700">
                <li>✓ Full control over packaging</li>
                <li>✓ Ship from your own warehouse</li>
                <li>✓ Lower fees per unit</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE CALCULATOR */}
      <section className="bg-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Estimate your revenue</h2>
          <p className="text-gray-600 mb-10">A quick calculator to estimate profit per sale.</p>

          <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg p-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product price</label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 bg-white">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="flex-1 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product cost</label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 bg-white">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="flex-1 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping cost</label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 bg-white">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={shipping}
                      onChange={(e) => setShipping(e.target.value)}
                      className="flex-1 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated selling fees</label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 bg-white">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={fees}
                      onChange={(e) => setFees(e.target.value)}
                      className="flex-1 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Estimated profit</p>
                <p className="text-5xl font-bold text-green-700 mb-2">${profit.toFixed(2)}</p>
                <p className="text-sm text-gray-600">
                  Margin: <span className="font-medium">{margin.toFixed(1)}%</span>
                </p>
                <div className="mt-6 text-xs text-gray-500 border-t pt-4">
                  Estimates only. Actual fees vary by category and fulfillment method.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT LISTING */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">List your products</h2>
          <p className="text-gray-600 mb-10">Get from idea to live listing in just a few steps.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: 1, t: 'Find an existing product', d: 'Search our catalog or create a new product.' },
              { n: 2, t: 'Add your offer', d: 'Set price, condition, and quantity.' },
              { n: 3, t: 'Add images & details', d: 'Upload photos, description, and keywords.' },
              { n: 4, t: 'Publish', d: 'Your product appears in the marketplace.' },
            ].map((s) => (
              <div key={s.n} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-[#c7511f] text-white flex items-center justify-center font-bold text-sm mb-3">
                  {s.n}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{s.t}</h3>
                <p className="text-sm text-gray-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section id="resources" className="bg-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Seller resources</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: 'Seller University', d: 'Free video courses on listing, fulfillment, and advertising.' },
              { t: 'Seller Forums', d: 'Connect with other sellers and share best practices.' },
              { t: 'Help Center', d: 'Searchable articles answering the most common seller questions.' },
            ].map((r) => (
              <div key={r.t} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-gray-900 mb-1">{r.t}</h3>
                <p className="text-sm text-gray-600">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[800px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Frequently asked questions</h2>

          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={f.q} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">{f.q}</span>
                    <ChevronDown
                      className={'w-5 h-5 text-gray-500 transition-transform ' + (open ? 'rotate-180' : '')}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-sm text-gray-700 border-t pt-3">{f.a}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-[#232f3e] to-[#131921] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to start selling?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Set up your seller account in minutes. No setup fee. Cancel anytime.
          </p>
          <Link
            to="/sell/register"
            className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-semibold px-8 py-3 rounded transition"
          >
            Start Selling <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
