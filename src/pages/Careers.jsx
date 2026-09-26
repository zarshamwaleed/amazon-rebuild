import { ArrowRight } from 'lucide-react'
import CompanyHero from '../components/company/CompanyHero'
import { useToast } from '../context/ToastContext'

const ROLES = [
  {
    title: 'Senior Product Designer',
    meta: 'Design · Remote',
    body: 'Shape the shopping and seller experiences end to end, from early concepts through shipped detail.',
  },
  {
    title: 'Full-Stack Engineer',
    meta: 'Engineering · Remote',
    body: 'Build the storefront, checkout, and seller tools on our React and Supabase stack.',
  },
  {
    title: 'Marketplace Operations Lead',
    meta: 'Operations · Hybrid — Austin',
    body: 'Own seller onboarding quality and the review process that keeps the catalog curated.',
  },
  {
    title: 'Brand Marketing Manager',
    meta: 'Marketing · Remote',
    body: 'Define how Avenzo sounds and looks everywhere customers encounter it, from email to packaging inserts.',
  },
  {
    title: 'Customer Experience Associate',
    meta: 'Support · Remote',
    body: 'Be the first real person a customer talks to when something goes wrong — and make it right.',
  },
]

export default function Careers() {
  const { pushToast } = useToast()

  const viewRole = () => {
    pushToast('Full role details aren’t available in this demo yet.', { type: 'info' })
  }

  return (
    <>
      <CompanyHero
        label="Careers"
        title="Careers at Avenzo"
        subtitle="Build the marketplace you'd actually want to shop on."
      />

      <div className="max-w-[900px] mx-auto px-6 py-16">
        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-4">Why Work Here</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            We're a small team that cares about the details most companies stop sweating once they hit scale.
            If you'd rather do fewer things well than many things adequately, you'll probably feel at home here.
          </p>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-6">Open Roles</h2>
          <div className="space-y-4">
            {ROLES.map((role) => (
              <div key={role.title} className="border border-stone-200 rounded-xl bg-bone-50 p-6">
                <h3 className="font-display text-[22px] text-charcoal-900">{role.title}</h3>
                <p className="text-caption mt-1 mb-3">{role.meta}</p>
                <p className="text-body-sm leading-relaxed mb-4">{role.body}</p>
                <button
                  onClick={viewRole}
                  className="group inline-flex items-center gap-1.5 text-body-sm font-medium text-charcoal-800 hover:text-brass-700 transition-avenzo"
                >
                  View role
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-base group-hover:translate-x-0.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-5">How We Hire</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            Our process is short on purpose: an application, a 30-minute intro call to make sure the role is a fit
            in both directions, a practical conversation grounded in real work you'd actually do, and then a
            decision. We aim to get back to every applicant either way, and we try not to drag it out — nobody
            benefits from a six-round process for a job that doesn't need one.
          </p>
        </section>

        <div className="border-t border-stone-200 my-14" />

        <section>
          <h2 className="font-display text-[32px] leading-tight text-charcoal-900 mb-5">Contact</h2>
          <p className="text-body leading-relaxed max-w-[640px]">
            Questions about a role or the hiring process can go to{' '}
            <a href="mailto:careers@avenzo.com" className="text-charcoal-900 underline underline-offset-2 hover:text-brass-700 transition-avenzo">
              careers@avenzo.com
            </a>
            . Avenzo is a fictional project built for demonstration purposes — this address is not monitored.
          </p>
        </section>
      </div>
    </>
  )
}
