import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const from = Math.max(1, page - 2)
  const to = Math.min(totalPages, page + 2)
  for (let i = from; i <= to; i++) pages.push(i)

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {from > 1 && (
        <>
          <button
            onClick={() => onChange(1)}
            className="px-3 py-1.5 rounded border border-gray-300 bg-white text-sm hover:bg-gray-50"
          >
            1
          </button>
          {from > 2 && <span className="px-2 text-gray-500">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={
            'px-3 py-1.5 rounded border text-sm ' +
            (p === page
              ? 'bg-[#232f3e] text-white border-[#232f3e]'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')
          }
        >
          {p}
        </button>
      ))}

      {to < totalPages && (
        <>
          {to < totalPages - 1 && <span className="px-2 text-gray-500">…</span>}
          <button
            onClick={() => onChange(totalPages)}
            className="px-3 py-1.5 rounded border border-gray-300 bg-white text-sm hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
