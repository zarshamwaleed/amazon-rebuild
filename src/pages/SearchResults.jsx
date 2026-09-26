import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import CategoryHeroBanner from '../components/CategoryHeroBanner'
import FilterSidebar from '../components/FilterSidebar'
import SortDropdown from '../components/SortDropdown'
import ProductGrid from '../components/ProductGrid'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Button from '../components/Button'
import { getAllCategories } from '../services/categoryService'
import { searchProducts } from '../services/productService'

const PAGE_SIZE = 12

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') || ''
  const categorySlug = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const minPrice = searchParams.get('min') ? Number(searchParams.get('min')) : undefined
  const maxPrice = searchParams.get('max') ? Number(searchParams.get('max')) : undefined

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const { data, count } = await searchProducts({
          q,
          categorySlug,
          minPrice,
          maxPrice,
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
  }, [q, categorySlug, minPrice, maxPrice, sort, page])

  function updateParams(patch) {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') next.delete(k)
      else next.set(k, String(v))
    })
    if (!('page' in patch)) next.delete('page')
    setSearchParams(next)
  }

  function clearFilters() {
    updateParams({ category: undefined, min: undefined, max: undefined })
  }

  const activeCategory = categories.find((c) => c.slug === categorySlug) || null
  const hasFilters = Boolean(activeCategory) || minPrice !== undefined || maxPrice !== undefined
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <CategoryHeroBanner
        eyebrow={
          <>
            <Search className="w-3.5 h-3.5" /> Search
          </>
        }
        title={
          q ? (
            <>
              Results for <span className="italic text-brass-700">&ldquo;{q}&rdquo;</span>
            </>
          ) : (
            'Search'
          )
        }
        description={q ? `Showing matches across our catalog` : undefined}
        resultCount={q ? total : undefined}
        monogramLabel={q || 'Search'}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Search' }]}
      />

      {!q && (
        <EmptyState
          title="Start typing to search"
          message="Use the search bar at the top to find products by title, brand, or description."
        />
      )}

      {q && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          <FilterSidebar
            categories={categories}
            activeCategoryId={activeCategory?.id}
            onCategoryChange={(cat) => updateParams({ category: cat ? cat.slug : undefined })}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={({ min, max }) => updateParams({ min, max })}
            onClear={clearFilters}
            resultCount={total}
          />

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center justify-between mb-5 gap-3">
              <p className="text-body-sm hidden sm:block">
                {loading ? 'Searching…' : `${total.toLocaleString()} result${total === 1 ? '' : 's'}`}
              </p>
              <SortDropdown value={sort} onChange={(v) => updateParams({ sort: v })} />
            </div>

            {loading ? (
              <LoadingSkeleton count={PAGE_SIZE} cols={3} />
            ) : error ? (
              <EmptyState title="Search failed" message={error} />
            ) : products.length === 0 ? (
              <EmptyState
                title={`No results for "${q}"`}
                message="Try different keywords, check your spelling, or browse our full catalog."
                action={
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {hasFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    )}
                    <Link to="/products">
                      <Button size="sm">Browse all products</Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <>
                <ProductGrid products={products} cols={4} />
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(p) => updateParams({ page: p })}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
