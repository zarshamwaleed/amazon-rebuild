import { Link } from 'react-router-dom'
import Reveal from '../Reveal'

export default function AuthSplitLayout({ eyebrow, heading, quote, quoteAttribution, image, children }) {
  return (
    <div className="relative left-1/2 -translate-x-1/2 w-screen">
      <div className="grid lg:grid-cols-2 lg:min-h-[82vh]">
        {/* Editorial panel */}
        <div className="relative hidden lg:block overflow-hidden">
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/85 via-charcoal-900/35 to-charcoal-900/10" />

          <div className="relative h-full flex flex-col justify-between p-12 xl:p-16">
            <Link to="/" className="font-display text-2xl text-bone-50 tracking-tight">
              Avenzo
            </Link>

            <Reveal className="max-w-md">
              {eyebrow && (
                <span className="text-av-label uppercase tracking-wide font-medium text-brass-200">
                  {eyebrow}
                </span>
              )}
              <p className="mt-4 font-display font-medium text-3xl xl:text-4xl leading-[1.15] text-bone-50">
                {heading}
              </p>

              {quote && (
                <blockquote className="mt-8 pt-8 border-t border-bone-50/20">
                  <p className="text-av-body-lg text-bone-100/90 italic leading-relaxed">
                    &ldquo;{quote}&rdquo;
                  </p>
                  {quoteAttribution && (
                    <cite className="block mt-3 text-av-caption not-italic text-bone-200/60 tracking-wide">
                      {quoteAttribution}
                    </cite>
                  )}
                </blockquote>
              )}
            </Reveal>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center px-6 py-14 sm:py-20 bg-bone-100">
          <Reveal className="w-full max-w-sm" delay={60}>
            <Link
              to="/"
              className="lg:hidden inline-block font-display text-xl text-charcoal-900 tracking-tight mb-10"
            >
              Avenzo
            </Link>
            {children}
          </Reveal>
        </div>
      </div>
    </div>
  )
}
