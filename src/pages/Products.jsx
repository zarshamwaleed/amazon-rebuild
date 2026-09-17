import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategoryHeader from '../components/CategoryHeader'
import FilterSidebar from '../components/FilterSidebar'
import SortDropdown from '../components/SortDropdown'
import ProductGrid from '../components/ProductGrid'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { getAllCategories } from '../services/categoryService'
import { queryProducts } from '../services/productService'

const PAGE_SIZE = 12

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const categorySlug = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const minPrice = searchParams.get('min') ? Number(searchParams.get('min')) : undefined
  const maxPrice = searchParams.get('max') ? Number(searchParams.get('max')) : undefined

  // Load categories once
  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {})
  }, [])

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug) || null,
    [categories, categorySlug]
  )

  // Load products whenever filters change
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const { data, count } = await queryProducts({
          categoryId: activeCategory ? activeCategory.id : undefined,
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
  }, [activeCategory, minPrice, maxPrice, sort, page])

  function updateParams(patch) {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') next.delete(k)
      else next.set(k, String(v))
    })
    if (!('page' in patch)) next.delete('page')
    setSearchParams(next)
  }

  function handleCategoryChange(cat) {
    updateParams({ category: cat ? cat.slug : undefined })
  }

  function handlePriceChange({ min, max }) {
    updateParams({ min, max })
  }

  function clearFilters() {
    updateParams({ category: undefined, min: undefined, max: undefined })
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const title = activeCategory ? activeCategory.name : 'All Products'
  const description = activeCategory?.description

  return (
    <div>
      <CategoryHeader title={title} count={total} description={description} />

      <div className="flex gap-8">
        <FilterSidebar
          categories={categories}
          activeCategoryId={activeCategory?.id}
          activeCategorySlug={categorySlug}
          onCategoryChange={handleCategoryChange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          onClear={clearFilters}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <SortDropdown value={sort} onChange={(v) => updateParams({ sort: v })} />
          </div>

          {loading ? (
            <LoadingSkeleton count={PAGE_SIZE} />
          ) : error ? (
            <EmptyState title="Could not load products" message={error} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your filters or browsing a different category."
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
        </div>
      </div>
    </div>
  )
}
