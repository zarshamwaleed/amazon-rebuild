import CompanyHero from '../components/company/CompanyHero'
import { useToast } from '../context/ToastContext'

const METRICS = [
  { label: 'Revenue Run-Rate', value: '$42.6M' },
  { label: 'Active Sellers', value: '4,180' },
  { label: 'Monthly Orders', value: '318K' },
  { label: 'GMV (TTM)', value: '$96.3M' },
]

const REPORTS = [
  { label: 'Q2 2026 Shareholder Letter', date: 'Jul 24, 2026' },
  { label: 'Q1 2026 Shareholder Letter', date: 'Apr 22, 2026' },
  { label: 'FY2025 Annual Report', date: 'Feb 12, 2026' },
  { label: 'Q4 2025 Shareholder Letter', date: 'Jan 21, 2026' },
]

export default function Investors() {
  const { pushToast } = useToast()

  return (
    <>
      <CompanyHero
        label="Investor Relations"
        title="Investor Relations"
        subtitle="Information for shareholders and the investment community."
      />

      <div className="max-w-[900px] mx-auto px-6 py-16">
        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-4">About Avenzo</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            Avenzo operates a curated online marketplace connecting independent sellers with customers who value
            considered, well-made goods over the widest possible selection. We generate revenue primarily through
            seller commissions, with a growing contribution from advertising and brand storefront subscriptions.
          </p>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-6">Key Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {METRICS.map((m) => (
              <div key={m.label} className="border border-stone-200 rounded-xl bg-bone-50 p-5">
                <p className="font-mono text-2xl font-semibold text-charcoal-900">{m.value}</p>
                <p className="text-label mt-2">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-6">Reports &amp; Filings</h2>
          <div className="border border-stone-200 rounded-xl bg-bone-50 divide-y divide-stone-200">
            {REPORTS.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-charcoal-800">{r.label}</p>
                  <p className="text-caption mt-0.5">{r.date}</p>
                </div>
                <button
                  onClick={() => pushToast('Filing downloads aren’t available in this demo.', { type: 'info' })}
                  className="h-8 px-3 text-xs rounded-lg border border-stone-300 bg-bone-50 text-charcoal-800 hover:bg-stone-100 hover:border-stone-400 transition-avenzo font-medium shrink-0"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-5">Investor Contact</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            For shareholder inquiries, reach the investor relations team at{' '}
            <a href="mailto:investors@avenzo.com" className="text-charcoal-900 underline underline-offset-2 hover:text-brass-700 transition-avenzo">
              investors@avenzo.com
            </a>
            .
          </p>
        </section>

        <p className="text-caption mt-14">
          Avenzo is a fictional project built for demonstration purposes. Any figures shown are illustrative.
        </p>
      </div>
    </>
  )
}
