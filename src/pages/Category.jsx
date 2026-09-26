import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CategoryHeroBanner from '../components/CategoryHeroBanner'
import FilterSidebar from '../components/FilterSidebar'
import SortDropdown from '../components/SortDropdown'
import ProductGrid from '../components/ProductGrid'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Button from '../components/Button'
import { getCategoryBySlug } from '../services/categoryService'
import { queryProducts } from '../services/productService'

const PAGE_SIZE = 12

export default function Category() {
  const { slug } = useParams()

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [priceRange, setPriceRange] = useState({})

  // Reset filters/sort/page whenever navigating to a different category
  useEffect(() => {
    setSort('newest')
    setPage(1)
    setPriceRange({})
  }, [slug])

  // Load category + products whenever slug/sort/page/price change
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const cat = await getCategoryBySlug(slug)
        if (cancelled) return
        if (!cat) {
          setCategory(null)
          setProducts([])
          setTotal(0)
          setLoading(false)
          return
        }
        setCategory(cat)

        const { data, count } = await queryProducts({
          categoryId: cat.id,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
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
  }, [slug, sort, page, priceRange])

  if (!loading && !category) {
    return (
      <EmptyState
        title="Category not found"
        message="The category you tried to open does not exist."
      />
    )
  }

  const hasFilters = priceRange.min !== undefined || priceRange.max !== undefined
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <CategoryHeroBanner
        eyebrow="Category"
        title={category?.name || 'Category'}
        resultCount={total}
        description={category?.description}
        image={category?.image_url}
        categorySlug={category?.slug}
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'All Products', to: '/products' },
          { label: category?.name || '' },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
        <FilterSidebar
          showCategoryFilter={false}
          minPrice={priceRange.min}
          maxPrice={priceRange.max}
          onPriceChange={(range) => {
            setPriceRange(range)
            setPage(1)
          }}
          onClear={() => setPriceRange({})}
          resultCount={total}
        />

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-5 gap-3">
            <p className="text-body-sm hidden sm:block">
              {loading ? 'Loading products…' : `${total.toLocaleString()} item${total === 1 ? '' : 's'}`}
            </p>
            <SortDropdown
              value={sort}
              onChange={(v) => {
                setSort(v)
                setPage(1)
              }}
            />
          </div>

          {loading ? (
            <LoadingSkeleton count={PAGE_SIZE} cols={3} />
          ) : error ? (
            <EmptyState title="Could not load products" message={error} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products in this category"
              message={hasFilters ? 'Try widening your price range.' : 'Check back soon.'}
              action={
                hasFilters ? (
                  <Button variant="outline" size="sm" onClick={() => setPriceRange({})}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <ProductGrid products={products} cols={4} />
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
