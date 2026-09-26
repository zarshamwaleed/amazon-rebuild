import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Nothing here', message, icon = Inbox, action, className = '' }) {
  const Icon = icon
  return (
    <div className={'text-center py-16 px-6 bg-bone-50 border border-dashed border-stone-300 rounded-xl ' + className}>
      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-charcoal-400" strokeWidth={1.5} />
      </div>
      <h3 className="heading-sub">{title}</h3>
      {message && <p className="text-body-sm mt-1.5 max-w-sm mx-auto">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
