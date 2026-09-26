import { Link } from 'react-router-dom'
import Reveal from './Reveal'

const STORY_IMAGE =
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80'

/**
 * The brand-story band, inverted (dark) for contrast against the rest of
 * the page. Deliberately not a full-bleed background photo with overlaid
 * text — the pull-quote runs wide and oversized, and the photo is a small
 * asymmetric inset instead, so the type does the work.
 */
export default function BrandStory({ id }) {
  return (
    <section id={id} className="relative left-1/2 -translate-x-1/2 w-screen bg-charcoal-900">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-8">
          <p className="font-mono text-[0.7rem] text-brass-300/80 tracking-[0.1em]">N&deg; 005 &mdash; The Ledger Entry</p>

          <Reveal variant="fade" as="p" className="mt-6">
            <span className="font-display italic text-bone-50 text-[2.1rem] sm:text-5xl lg:text-[3.75rem] leading-[1.12] tracking-tight block">
              &ldquo;We&rsquo;d rather sell you one thing you keep for ten years than ten
              things you replace next season.&rdquo;
            </span>
          </Reveal>

          <p className="font-mono text-[0.7rem] text-bone-100/60 tracking-[0.1em] mt-8">
            &mdash; The Avenzo Buying Team
          </p>

          <Link
            to="/about"
            className="group inline-flex items-baseline gap-2 mt-8 text-bone-50 border-b border-bone-50/40 pb-1 hover:border-bone-50 transition-avenzo"
          >
            Read the full entry
            <span
              aria-hidden="true"
              className="transition-transform duration-base group-hover:translate-x-0.5"
            >
              &rarr;
            </span>
          </Link>
        </div>

        {/* Small asymmetric inset — not a full-bleed background photo */}
        <div className="hidden lg:block lg:col-span-4 relative aspect-[3/4] justify-self-end w-4/5">
          <img
            src={STORY_IMAGE}
            alt="A maker's workbench, mid-craft"
            className="w-full h-full object-cover"
          />
          <span className="absolute -bottom-4 -left-4 font-mono text-[0.65rem] tracking-[0.1em] uppercase text-bone-50/70 bg-charcoal-900 border border-bone-50/20 px-2 py-1">
            Plate II
          </span>
        </div>
      </div>
    </section>
  )
}
