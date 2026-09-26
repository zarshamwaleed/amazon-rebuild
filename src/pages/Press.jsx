import { ArrowRight } from 'lucide-react'
import CompanyHero from '../components/company/CompanyHero'
import { useToast } from '../context/ToastContext'

const RELEASES = [
  {
    date: 'AUG 2026',
    headline: 'Avenzo launches a seller sustainability fund',
    summary: 'A revenue-share program helps sellers offset packaging and shipping emissions.',
  },
  {
    date: 'MAY 2026',
    headline: 'Avenzo passes 4,000 curated sellers',
    summary: 'Growth stays deliberately slow — every seller still goes through manual onboarding review.',
  },
  {
    date: 'FEB 2026',
    headline: 'Avenzo introduces Store Builder for brand storefronts',
    summary: 'Sellers can now design a dedicated storefront page instead of a bare product listing grid.',
  },
  {
    date: 'NOV 2025',
    headline: 'Avenzo opens gift card marketplace',
    summary: 'Digital and physical gift cards join the catalog, with balance tracking built into every account.',
  },
]

export default function Press() {
  const { pushToast } = useToast()

  return (
    <>
      <CompanyHero
        label="Press"
        title="Press"
        subtitle="News, media resources, and inquiries."
      />

      <div className="max-w-[900px] mx-auto px-6 py-16">
        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-6">Recent Announcements</h2>
          <div className="space-y-5">
            {RELEASES.map((r) => (
              <div key={r.headline} className="border-b border-stone-200 pb-5 last:border-b-0">
                <p className="font-mono text-[11px] uppercase tracking-wide text-charcoal-500">{r.date}</p>
                <h3 className="font-display text-[20px] text-charcoal-900 mt-1.5">{r.headline}</h3>
                <p className="text-body-sm mt-1.5 leading-relaxed">{r.summary}</p>
                <button
                  onClick={() => pushToast('Full release text isn’t available in this demo yet.', { type: 'info' })}
                  className="group inline-flex items-center gap-1.5 text-body-sm font-medium text-charcoal-800 hover:text-brass-700 transition-avenzo mt-3"
                >
                  Read release
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-base group-hover:translate-x-0.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-4">Media Kit</h2>
          <p className="text-body leading-relaxed max-w-[640px] mb-5">
            Our media kit includes the Avenzo logo in a few formats, brand color values, and a handful of
            product photography samples cleared for editorial use.
          </p>
          <button
            onClick={() => pushToast('Media kit download isn’t wired up in this demo.', { type: 'info' })}
            className="h-10 px-4 text-sm rounded-lg border border-stone-300 bg-bone-50 text-charcoal-800 hover:bg-stone-100 hover:border-stone-400 transition-avenzo font-medium"
          >
            Download media kit
          </button>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-5">Press Inquiries</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            For interviews, comment, or background on Avenzo, reach us at{' '}
            <a href="mailto:press@avenzo.com" className="text-charcoal-900 underline underline-offset-2 hover:text-brass-700 transition-avenzo">
              press@avenzo.com
            </a>
            . Avenzo is a fictional project built for demonstration purposes — this address is not monitored.
          </p>
        </section>
      </div>
    </>
  )
}
