import CompanyHero from '../components/company/CompanyHero'

const PRINCIPLES = [
  {
    title: 'Every product earns its place',
    body: 'Nothing lands on Avenzo by default. Each listing is reviewed before it goes live, and it can be pulled if it stops meeting the bar.',
  },
  {
    title: 'Design matters as much as price',
    body: 'A good deal on something poorly made is still a bad deal. We weight craft and durability alongside cost when we decide what belongs here.',
  },
  {
    title: 'Sellers are partners, not vendors',
    body: 'We build tools assuming sellers will be here for years, not for one holiday season — that changes what we choose to prioritize.',
  },
  {
    title: 'No dark patterns, ever',
    body: 'No countdown timers that reset, no fake scarcity, no pre-checked upsells. If a feature only works by misleading someone, we don’t ship it.',
  },
]

export default function About() {
  return (
    <>
      <CompanyHero
        label="About"
        title="About Avenzo"
        subtitle="Why we built a different kind of marketplace."
      />

      <div className="max-w-[900px] mx-auto px-6 py-16">
        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-5">The Story</h2>
          <div className="space-y-4 max-w-[640px]">
            <p className="text-body leading-relaxed">
              Avenzo started from a small frustration: shopping online had become an exercise in filtering out noise.
              Endless near-duplicate listings, reviews that felt manufactured, and a search experience optimized for
              whoever bid the most — not for what was actually good. We wanted to see if a marketplace could feel
              considered instead, the way a well-run independent shop does, but at the scale the internet allows.
            </p>
            <p className="text-body leading-relaxed">
              That meant saying no to a lot of things marketplaces usually say yes to: unlimited listings per seller,
              pay-to-rank search results, and reviews that can be bought. In exchange, we could spend our effort on
              the parts that actually change whether a purchase feels good a year later — sourcing, presentation, and
              the after-sale experience.
            </p>
            <p className="text-body leading-relaxed">
              Avenzo is still early. We're a small team making deliberate trade-offs, and we'd rather grow slowly in
              the right direction than quickly in the wrong one.
            </p>
          </div>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-6">What We Believe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="border border-stone-200 rounded-xl bg-bone-50 p-6">
                <h3 className="heading-sub mb-2">{p.title}</h3>
                <p className="text-body-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-5">How We Work</h2>
          <div className="space-y-4 max-w-[640px]">
            <p className="text-body leading-relaxed">
              Every seller who joins Avenzo goes through an onboarding review before their first listing goes live —
              we look at product photography, sourcing, and how they've handled returns and disputes elsewhere.
              It's a higher bar than a typical marketplace signup, and that's intentional.
            </p>
            <p className="text-body leading-relaxed">
              After that, curation doesn't stop. We track return rates, review sentiment, and delivery performance
              per seller, and we work directly with sellers who are trending the wrong way before it becomes a
              customer's problem. The goal isn't to police sellers — it's to keep the incentives pointed at the same
              thing customers want: products worth keeping.
            </p>
          </div>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-5">Contact</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            Questions about Avenzo can be sent to{' '}
            <a href="mailto:hello@avenzo.com" className="text-charcoal-900 underline underline-offset-2 hover:text-brass-700 transition-avenzo">
              hello@avenzo.com
            </a>
            . Avenzo is a fictional project built for demonstration purposes — this address is not monitored.
          </p>
        </section>
      </div>
    </>
  )
}
