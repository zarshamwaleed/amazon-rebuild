import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategoryHeroBanner from '../components/CategoryHeroBanner'
import FilterSidebar from '../components/FilterSidebar'
import SortDropdown from '../components/SortDropdown'
import ProductGrid from '../components/ProductGrid'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Button from '../components/Button'
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

  const hasFilters = Boolean(activeCategory) || minPrice !== undefined || maxPrice !== undefined
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const title = activeCategory ? activeCategory.name : 'All Products'
  const description = activeCategory?.description

  return (
    <div>
      <CategoryHeroBanner
        eyebrow={activeCategory ? 'Category' : 'Shop'}
        title={title}
        resultCount={total}
        description={description}
        image={activeCategory?.image_url}
        categorySlug={activeCategory?.slug}
        breadcrumb={
          activeCategory
            ? [{ label: 'Home', to: '/' }, { label: 'All Products', to: '/products' }, { label: activeCategory.name }]
            : [{ label: 'Home', to: '/' }, { label: 'All Products' }]
        }
      />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
        <FilterSidebar
          categories={categories}
          activeCategoryId={activeCategory?.id}
          onCategoryChange={handleCategoryChange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          onClear={clearFilters}
          resultCount={total}
        />

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-5 gap-3">
            <p className="text-body-sm hidden sm:block">
              {loading ? 'Loading products…' : `${total.toLocaleString()} item${total === 1 ? '' : 's'}`}
            </p>
            <SortDropdown value={sort} onChange={(v) => updateParams({ sort: v })} />
          </div>

          {loading ? (
            <LoadingSkeleton count={PAGE_SIZE} cols={3} />
          ) : error ? (
            <EmptyState title="Could not load products" message={error} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your filters or browsing a different category."
              action={
                hasFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
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
    </div>
  )
}
