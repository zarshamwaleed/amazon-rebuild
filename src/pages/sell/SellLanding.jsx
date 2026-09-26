import { useNavigate } from 'react-router-dom'
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
import Button from '../../components/Button'
import Card from '../../components/Card'
import Reveal from '../../components/home/Reveal'

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

const TRUST_FACTS = [
  { k: 'Fees', v: '$0.99', sub: 'Per item, individual plan — no surprises' },
  { k: 'Payouts', v: '14 days', sub: 'Deposited straight to your account' },
  { k: 'Setup', v: '$0', sub: 'No listing fee, no minimum commitment' },
  { k: 'Support', v: 'Always on', sub: 'Seller Central and Help Center, any time' },
]

const FAQS = [
  {
    q: 'How much does it cost to sell on Avenzo?',
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

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80'

export default function SellLanding() {
  const navigate = useNavigate()
  const [price, setPrice] = useState(49.99)
  const [cost, setCost] = useState(20.0)
  const [shipping, setShipping] = useState(5.0)
  const [fees, setFees] = useState(7.5)
  const [openFaq, setOpenFaq] = useState(null)

  const profit = Math.max(0, (Number(price) || 0) - (Number(cost) || 0) - (Number(shipping) || 0) - (Number(fees) || 0))
  const margin = Number(price) > 0 ? (profit / Number(price)) * 100 : 0

  return (
    <div>
      {/* HERO — asymmetric: copy dominant, one restrained image */}
      <section className="bg-bone-50">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-10 lg:gap-8 items-center px-4 sm:px-6 py-16 md:py-24">
          <Reveal variant="up" className="lg:col-span-7">
            <p className="text-av-label uppercase tracking-[0.1em] text-brass-700 font-medium mb-4">
              Sell on Avenzo
            </p>
            <h1 className="font-display text-display-sm md:text-display text-charcoal-900 leading-[1.08] tracking-tight mb-6">
              Your products, in front of buyers who are already looking.
            </h1>
            <p className="text-av-body-lg text-charcoal-600 max-w-lg mb-8">
              List in minutes. Manage orders, pricing, and fulfillment from one calm
              dashboard built for independent sellers.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => navigate('/sell/register')}>
                Start selling <ArrowRight className="w-4 h-4" />
              </Button>
              <a
                href="#how-it-works"
                className="inline-flex items-center h-12 px-6 rounded-lg text-base font-medium text-charcoal-700 hover:text-charcoal-900 hover:bg-stone-100 transition-avenzo"
              >
                Learn more
              </a>
            </div>
            <p className="text-av-body-sm text-charcoal-400 mt-8">
              No setup fee &middot; Cancel anytime &middot; Simulated demo environment
            </p>
          </Reveal>

          <Reveal variant="scale" delay={120} className="hidden lg:block lg:col-span-5">
            <div className="relative aspect-[4/5] w-4/5 ml-auto rounded-xl overflow-hidden shadow-lifted">
              <img
                src={HERO_IMAGE}
                alt="A seller preparing products for their store"
                className="w-full h-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHY SELL */}
      <section className="py-16 md:py-24 border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Reveal variant="up" className="max-w-xl mb-10 md:mb-14">
            <p className="text-av-label uppercase tracking-[0.1em] text-brass-700 font-medium mb-3">
              Why sell here
            </p>
            <h2 className="font-display text-heading-page md:text-display-sm text-charcoal-900">
              Built for people who take their business seriously.
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_SELL.map((w, i) => {
              const Icon = w.icon
              return (
                <Reveal key={w.title} variant="up" delay={i * 80}>
                  <Card hoverable padding="md" className="h-full">
                    <Icon className="w-6 h-6 text-brass-600 mb-4" strokeWidth={1.5} />
                    <h3 className="heading-sub mb-1.5">{w.title}</h3>
                    <p className="text-av-body-sm text-charcoal-600">{w.desc}</p>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 bg-stone-50 border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Reveal variant="up" className="max-w-xl mb-10 md:mb-14">
            <p className="text-av-label uppercase tracking-[0.1em] text-brass-700 font-medium mb-3">
              How it works
            </p>
            <h2 className="font-display text-heading-page md:text-display-sm text-charcoal-900">
              Six steps from sign-up to your first sale.
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.n} variant="up" delay={(i % 3) * 80}>
                <div className="flex gap-4">
                  <span className="font-display italic text-3xl text-brass-500 leading-none flex-shrink-0">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="heading-sub mb-1">{s.title}</h3>
                    <p className="text-av-body-sm text-charcoal-600">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="pricing" className="py-16 md:py-24 border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Reveal variant="up" className="max-w-xl mb-10 md:mb-14">
            <p className="text-av-label uppercase tracking-[0.1em] text-brass-700 font-medium mb-3">
              Plans
            </p>
            <h2 className="font-display text-heading-page md:text-display-sm text-charcoal-900">
              Choose a selling plan.
            </h2>
            <p className="text-av-body text-charcoal-600 mt-3">
              Start free. Upgrade when you're ready to scale.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <Reveal variant="up">
              <Card padding="lg" className="h-full flex flex-col">
                <h3 className="heading-sub text-charcoal-900 mb-1">Individual</h3>
                <div className="my-4">
                  <span className="font-display text-display-sm text-charcoal-900">$0.99</span>
                  <span className="text-charcoal-500 ml-2 text-av-body-sm">per item sold</span>
                </div>
                <p className="text-av-body-sm text-charcoal-600 mb-6">Good for occasional sellers.</p>
                <ul className="space-y-2.5 mb-8 text-av-body-sm text-charcoal-700">
                  {['List products', 'Manage orders', 'Manage inventory', 'Basic seller tools'].map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="lg"
                  className="mt-auto w-full"
                  onClick={() => navigate('/sell/register?plan=individual')}
                >
                  Choose Individual
                </Button>
              </Card>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <Card padding="lg" className="h-full flex flex-col relative border-brass-300 ring-1 ring-brass-300">
                <span className="absolute -top-3 left-8 bg-brass-400 text-charcoal-900 text-[0.65rem] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                  Most popular
                </span>
                <h3 className="heading-sub text-charcoal-900 mb-1">Professional</h3>
                <div className="my-4">
                  <span className="font-display text-display-sm text-charcoal-900">$39.99</span>
                  <span className="text-charcoal-500 ml-2 text-av-body-sm">per month</span>
                </div>
                <p className="text-av-body-sm text-charcoal-600 mb-6">For growing businesses.</p>
                <ul className="space-y-2.5 mb-8 text-av-body-sm text-charcoal-700">
                  {['Bulk listing', 'Advanced reports', 'Advertising', 'Automated pricing', 'Advanced seller tools'].map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className="mt-auto w-full"
                  onClick={() => navigate('/sell/register?plan=professional')}
                >
                  Choose Professional
                </Button>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FULFILLMENT */}
      <section className="py-16 md:py-24 bg-stone-50 border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Reveal variant="up" className="max-w-xl mb-10 md:mb-14">
            <p className="text-av-label uppercase tracking-[0.1em] text-brass-700 font-medium mb-3">
              Fulfillment
            </p>
            <h2 className="font-display text-heading-page md:text-display-sm text-charcoal-900">
              Choose how you fulfill orders.
            </h2>
            <p className="text-av-body text-charcoal-600 mt-3 max-w-lg">
              Fulfillment by Avenzo handles storage, packing, and shipping. Or ship products yourself.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            <Reveal variant="up">
              <Card padding="lg" className="h-full">
                <Package className="w-8 h-8 text-brass-600 mb-4" strokeWidth={1.5} />
                <h3 className="heading-sub mb-2">Fulfillment by Avenzo (FBA)</h3>
                <p className="text-av-body-sm text-charcoal-600 mb-5">
                  We store, pick, pack, and ship your products, and handle customer service and returns.
                </p>
                <ul className="space-y-2 text-av-body-sm text-charcoal-700">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" /> Avenzo handles storage and shipping</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" /> Products become Prime eligible</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" /> Faster delivery to customers</li>
                </ul>
              </Card>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <Card padding="lg" className="h-full">
                <Truck className="w-8 h-8 text-brass-600 mb-4" strokeWidth={1.5} />
                <h3 className="heading-sub mb-2">Fulfilled by Merchant (FBM)</h3>
                <p className="text-av-body-sm text-charcoal-600 mb-5">
                  You store, pack, and ship your products yourself, with complete control over packaging.
                </p>
                <ul className="space-y-2 text-av-body-sm text-charcoal-700">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" /> Full control over packaging</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" /> Ship from your own warehouse</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" /> Lower fees per unit</li>
                </ul>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* REVENUE CALCULATOR */}
      <section className="py-16 md:py-24 border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Reveal variant="up" className="max-w-xl mb-10 md:mb-14">
            <p className="text-av-label uppercase tracking-[0.1em] text-brass-700 font-medium mb-3">
              Tools
            </p>
            <h2 className="font-display text-heading-page md:text-display-sm text-charcoal-900">
              Estimate your revenue.
            </h2>
            <p className="text-av-body text-charcoal-600 mt-3">A quick calculator to estimate profit per sale.</p>
          </Reveal>

          <Reveal variant="up">
            <Card padding="lg" className="max-w-2xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <CalcField label="Product price" value={price} onChange={setPrice} />
                  <CalcField label="Product cost" value={cost} onChange={setCost} />
                  <CalcField label="Shipping cost" value={shipping} onChange={setShipping} />
                  <CalcField label="Estimated selling fees" value={fees} onChange={setFees} />
                </div>

                <div className="bg-stone-50 rounded-xl p-6 border border-stone-200 flex flex-col justify-center">
                  <p className="text-av-label uppercase tracking-wide text-charcoal-500 mb-1">Estimated profit</p>
                  <p className="font-display text-display-sm text-success-700 mb-2">${profit.toFixed(2)}</p>
                  <p className="text-av-body-sm text-charcoal-600">
                    Margin: <span className="font-medium text-charcoal-800">{margin.toFixed(1)}%</span>
                  </p>
                  <div className="mt-6 text-av-caption text-charcoal-400 border-t border-stone-200 pt-4">
                    Estimates only. Actual fees vary by category and fulfillment method.
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 md:py-24 bg-stone-50 border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Reveal variant="up" className="max-w-xl mb-10 md:mb-14">
            <p className="text-av-label uppercase tracking-[0.1em] text-brass-700 font-medium mb-3">
              What to expect
            </p>
            <h2 className="font-display text-heading-page md:text-display-sm text-charcoal-900">
              Straightforward, from day one.
            </h2>
          </Reveal>

          <Reveal variant="fade">
            <div className="border-t border-stone-300">
              {TRUST_FACTS.map((f) => (
                <div
                  key={f.k}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 border-b border-stone-300"
                >
                  <div className="flex items-baseline gap-4 sm:gap-8 min-w-0">
                    <span className="font-mono text-av-label uppercase tracking-wide text-charcoal-500 w-20 sm:w-28 shrink-0">
                      {f.k}
                    </span>
                    <span className="text-av-body-sm sm:text-av-body text-charcoal-600 truncate">{f.sub}</span>
                  </div>
                  <span className="font-display text-xl sm:text-2xl text-charcoal-900 shrink-0">{f.v}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* RESOURCES */}
      <section id="resources" className="py-16 md:py-24 border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Reveal variant="up" className="max-w-xl mb-10 md:mb-14">
            <p className="text-av-label uppercase tracking-[0.1em] text-brass-700 font-medium mb-3">
              Resources
            </p>
            <h2 className="font-display text-heading-page md:text-display-sm text-charcoal-900">
              Learn as you grow.
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { t: 'Seller University', d: 'Free video courses on listing, fulfillment, and advertising.' },
              { t: 'Seller Forums', d: 'Connect with other sellers and share best practices.' },
              { t: 'Help Center', d: 'Searchable articles answering the most common seller questions.' },
            ].map((r, i) => (
              <Reveal key={r.t} variant="up" delay={i * 80}>
                <Card hoverable padding="md" className="h-full">
                  <h3 className="heading-sub mb-1.5">{r.t}</h3>
                  <p className="text-av-body-sm text-charcoal-600">{r.d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-stone-50 border-t border-stone-200">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <Reveal variant="up" className="mb-10 md:mb-14">
            <p className="text-av-label uppercase tracking-[0.1em] text-brass-700 font-medium mb-3">
              FAQ
            </p>
            <h2 className="font-display text-heading-page md:text-display-sm text-charcoal-900">
              Frequently asked questions.
            </h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={f.q} className="bg-bone-50 border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-stone-50 transition-avenzo"
                    aria-expanded={open}
                  >
                    <span className="font-medium text-charcoal-900 text-av-body">{f.q}</span>
                    <ChevronDown
                      className={'w-5 h-5 text-charcoal-400 transition-transform duration-base flex-shrink-0 ' + (open ? 'rotate-180' : '')}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-av-body-sm text-charcoal-600 border-t border-stone-200 pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-charcoal-900 py-16 md:py-24">
        <Reveal variant="up" className="max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-display-sm md:text-display text-bone-50 mb-4">
            Ready to start selling?
          </h2>
          <p className="text-av-body-lg text-stone-300 mb-9 max-w-xl mx-auto">
            Set up your seller account in minutes. No setup fee. Cancel anytime.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/sell/register')}
          >
            Start selling <ArrowRight className="w-4 h-4" />
          </Button>
        </Reveal>
      </section>
    </div>
  )
}

function CalcField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-av-label text-charcoal-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2 border border-stone-300 rounded-lg px-3 py-2.5 bg-bone-50 focus-within:border-brass-400 focus-within:shadow-focus-ring transition-avenzo">
        <DollarSign className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent focus:outline-none text-av-body-sm text-charcoal-800"
        />
      </div>
    </div>
  )
}
