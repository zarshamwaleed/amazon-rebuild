import { Check } from 'lucide-react'
import CompanyHero from '../components/company/CompanyHero'

const BUILT = [
  'Full keyboard navigation across menus, forms, and modals',
  'Visible focus states on every interactive element',
  'Semantic HTML for headings, landmarks, and lists',
  'Screen reader labels on icon-only buttons and controls',
  'Respects the reduced-motion preference for animations and transitions',
  'Sufficient color contrast for text against its background',
  'No autoplay media, anywhere',
]

export default function Accessibility() {
  return (
    <>
      <CompanyHero
        label="Accessibility"
        title="Accessibility"
        subtitle="Avenzo is designed for everyone."
      />

      <div className="max-w-[900px] mx-auto px-6 py-16">
        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-4">Our Standards</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            We treat WCAG 2.2 Level AA as the baseline for every page we ship, not an audit we run after the fact.
            That means accessibility is a review criterion during design and development, the same as performance
            or correctness — not a pass we do at the end.
          </p>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-6">What We've Built</h2>
          <ul className="space-y-3 max-w-[640px]">
            {BUILT.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-success-50 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-3 h-3 text-success-700" />
                </span>
                <span className="text-body leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-4">Known Limitations</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            We're not finished. Some data-dense seller dashboards still lean on visual layout more than we'd like,
            a few third-party embeds (like payment widgets) don't fully match our contrast standards, and we haven't
            done a full audit of every page with a screen reader yet — only the primary shopping and account flows.
            We're working through the rest in order of how often people actually hit them.
          </p>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-5">Feedback</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            If you run into a barrier anywhere on Avenzo, please tell us — specific and unglamorous reports are
            what actually get things fixed. Reach us at{' '}
            <a href="mailto:accessibility@avenzo.com" className="text-charcoal-900 underline underline-offset-2 hover:text-brass-700 transition-avenzo">
              accessibility@avenzo.com
            </a>
            .
          </p>
        </section>
      </div>
    </>
  )
}
