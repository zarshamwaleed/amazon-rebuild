import { Check } from 'lucide-react'

export default function CheckoutSteps({ steps, currentStep, onStepClick }) {
  return (
    <ol className="flex items-start">
      {steps.map((step, i) => {
        const index = i + 1
        const done = index < currentStep
        const current = index === currentStep
        const clickable = done
        const Icon = step.icon

        return (
          <li key={step.id} className="flex-1 flex items-start last:flex-none">
            <button
              type="button"
              onClick={() => clickable && onStepClick(index)}
              disabled={!clickable}
              className={
                'flex flex-col items-center gap-2 text-center group ' +
                (clickable ? 'cursor-pointer' : 'cursor-default')
              }
            >
              <span
                className={
                  'flex items-center justify-center w-9 h-9 rounded-full border-2 transition-avenzo flex-shrink-0 ' +
                  (done
                    ? 'bg-brass-400 border-brass-400 text-charcoal-900'
                    : current
                    ? 'bg-bone-50 border-brass-400 text-brass-700 shadow-focus-ring'
                    : 'bg-bone-50 border-stone-300 text-charcoal-400') +
                  (clickable ? ' group-hover:border-brass-500' : '')
                }
              >
                {done ? <Check className="w-4 h-4" /> : Icon ? <Icon className="w-4 h-4" /> : index}
              </span>
              <span
                className={
                  'hidden sm:block text-av-label uppercase tracking-wide whitespace-nowrap ' +
                  (current ? 'text-charcoal-900 font-semibold' : done ? 'text-charcoal-600' : 'text-charcoal-400')
                }
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={
                  'h-0.5 flex-1 mx-2 sm:mx-3 mt-[18px] rounded-full transition-avenzo ' +
                  (index < currentStep ? 'bg-brass-400' : 'bg-stone-200')
                }
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
