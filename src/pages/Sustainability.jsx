import { Leaf, Recycle, Wind, HandCoins } from 'lucide-react'
import CompanyHero from '../components/company/CompanyHero'

const PILLARS = [
  {
    icon: Wind,
    title: 'Carbon-neutral delivery',
    body: "We purchase verified carbon offsets for every shipment's estimated emissions, and we're working with our largest carriers on route consolidation to cut the emissions we need to offset in the first place.",
  },
  {
    icon: Recycle,
    title: 'Recyclable packaging',
    body: 'Avenzo-branded packaging is curbside recyclable, and sellers using our fulfillment tools default to right-sized, minimal-void boxes instead of a single oversized standard.',
  },
  {
    icon: Leaf,
    title: 'Responsible sourcing',
    body: 'Sellers are asked to disclose material origins and manufacturing conditions during onboarding, and that information factors into which sellers we choose to grow with.',
  },
  {
    icon: HandCoins,
    title: 'Seller sustainability fund',
    body: "A share of Avenzo's commission revenue funds grants that help small sellers switch to better packaging or greener shipping without absorbing the cost themselves.",
  },
]

export default function Sustainability() {
  return (
    <>
      <CompanyHero
        label="Sustainability"
        title="Sustainability"
        subtitle="How we're reducing our footprint — and helping sellers do the same."
      />

      <div className="max-w-[900px] mx-auto px-6 py-16">
        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-4">Our Commitment</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            A marketplace that curates for quality has a responsibility to think past the transaction — a product
            worth keeping is also a product that doesn't end up in a landfill in six months. We take that
            seriously, and we'd rather move at a pace we can actually sustain than announce targets we can't back up.
          </p>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-6">Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="border border-stone-200 rounded-xl bg-bone-50 p-6">
                <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center mb-3">
                  <p.icon className="w-[18px] h-[18px] text-success-700" />
                </div>
                <h3 className="heading-sub mb-2">{p.title}</h3>
                <p className="text-body-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-4">Progress</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            We're early, but we're serious. Offsetting shipments and standardizing packaging were the first two
            things we could do without waiting on anyone else, so that's where we started. The sourcing disclosure
            requirement and the seller fund came later, and both are still rolling out — not every seller on Avenzo
            has been through them yet. We'd rather tell you where we actually are than round up.
          </p>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-4">Get Involved</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            Customers can choose consolidated shipping at checkout to reduce the number of boxes an order takes,
            and sellers can apply for a sustainability fund grant from their Seller Central dashboard once they've
            completed sourcing disclosure. Both add up more than either one alone.
          </p>
        </section>
      </div>
    </>
  )
}
