import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

function PageButton({ p, page, onChange }) {
  const active = p === page
  return (
    <button
      type="button"
      onClick={() => onChange(p)}
      aria-current={active ? 'page' : undefined}
      className={
        'w-9 h-9 rounded-full text-av-body-sm font-medium transition-avenzo ' +
        (active ? 'bg-charcoal-900 text-bone-50' : 'text-charcoal-600 hover:bg-stone-100 hover:text-charcoal-900')
      }
    >
      {p}
    </button>
  )
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const from = Math.max(1, page - 2)
  const to = Math.min(totalPages, page + 2)
  for (let i = from; i <= to; i++) pages.push(i)

  return (
    <nav className="flex flex-col items-center gap-2.5 mt-10 md:mt-12" aria-label="Pagination">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="w-9 h-9 rounded-full inline-flex items-center justify-center text-charcoal-600 hover:bg-stone-100 hover:text-charcoal-900 transition-avenzo disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {from > 1 && (
          <>
            <PageButton p={1} page={page} onChange={onChange} />
            {from > 2 && (
              <span className="w-9 h-9 flex items-center justify-center text-charcoal-300">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            )}
          </>
        )}

        {pages.map((p) => (
          <PageButton key={p} p={p} page={page} onChange={onChange} />
        ))}

        {to < totalPages && (
          <>
            {to < totalPages - 1 && (
              <span className="w-9 h-9 flex items-center justify-center text-charcoal-300">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            )}
            <PageButton p={totalPages} page={page} onChange={onChange} />
          </>
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="w-9 h-9 rounded-full inline-flex items-center justify-center text-charcoal-600 hover:bg-stone-100 hover:text-charcoal-900 transition-avenzo disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <p className="text-caption">
        Page {page} of {totalPages}
      </p>
    </nav>
  )
}
