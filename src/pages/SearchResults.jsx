import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CategoryHeader from '../components/CategoryHeader'
import SortDropdown from '../components/SortDropdown'
import ProductGrid from '../components/ProductGrid'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { searchProducts } from '../services/productService'

const PAGE_SIZE = 12

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') || ''
  const categorySlug = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const { data, count } = await searchProducts({
          q,
          categorySlug,
          sort,
          page,
          pageSize: PAGE_SIZE,
        })
        if (cancelled) return
        setProducts(data || [])
        setTotal(count || 0)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [q, categorySlug, sort, page])

  function updateParams(patch) {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') next.delete(k)
      else next.set(k, String(v))
    })
    if (!('page' in patch)) next.delete('page')
    setSearchParams(next)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const title = q ? 'Results for: ' + q : 'Search'

  return (
    <div>
      <CategoryHeader title={title} count={total} />

      {!q && (
        <EmptyState
          title="Start typing to search"
          message="Use the search bar at the top to find products by title, brand, or description."
        />
      )}

      {q && (
        <>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <SortDropdown value={sort} onChange={(v) => updateParams({ sort: v })} />
          </div>

          {loading ? (
            <LoadingSkeleton count={PAGE_SIZE} />
          ) : error ? (
            <EmptyState title="Search failed" message={error} />
          ) : products.length === 0 ? (
            <EmptyState
              title={'No results for "' + q + '"'}
              message="Try different keywords or browse our full catalog."
            />
          ) : (
            <>
              <ProductGrid products={products} cols={3} />
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(p) => updateParams({ page: p })}
              />
            </>
          )}
        </>
      )}

      {products.length === 0 && !loading && q && (
        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2">Suggestions:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Check your spelling</li>
            <li>Try more general keywords</li>
            <li>
              <Link to="/products" className="text-blue-600 hover:underline">
                Browse all products
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
