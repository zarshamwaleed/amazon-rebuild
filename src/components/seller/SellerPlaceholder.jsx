import { Hammer } from 'lucide-react'

export default function SellerPlaceholder({ title, note }) {
  return (
    <div className="bg-bone-50 rounded-xl border border-dashed border-stone-300 p-12 text-center">
      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
        <Hammer className="w-5 h-5 text-charcoal-400" strokeWidth={1.5} />
      </div>
      <h1 className="heading-page mb-2">{title}</h1>
      <p className="text-body-sm max-w-md mx-auto">
        {note || 'This page will be built in a later module.'}
      </p>
    </div>
  )
}
