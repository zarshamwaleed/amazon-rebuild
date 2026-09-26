import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Search, Loader2, ArrowUpRight, PackageSearch } from 'lucide-react'
import { searchProducts } from '../services/productService'
import { formatPrice } from '../lib/utils'

const SUGGESTION_LIMIT = 5
const DEBOUNCE_MS = 260

export default function SearchBar({ variant = 'desktop', autoFocus = false, onNavigate }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const rootRef = useRef(null)
  const debounceRef = useRef(null)
  const requestId = useRef(0)

  // Keep the field in sync with the URL while the search results page is active
  useEffect(() => {
    if (location.pathname === '/search') {
      setQuery(searchParams.get('q') || '')
    }
  }, [location.pathname, searchParams])

  // Debounced suggestion fetch
  useEffect(() => {
    const term = query.trim()
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (term.length < 2) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const thisRequest = ++requestId.current
      try {
        const { data } = await searchProducts({ q: term, pageSize: SUGGESTION_LIMIT, sort: 'rating' })
        if (thisRequest !== requestId.current) return
        setResults(data || [])
        setSearched(true)
      } catch {
        if (thisRequest !== requestId.current) return
        setResults([])
        setSearched(true)
      } finally {
        if (thisRequest === requestId.current) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  useEffect(() => {
    setActiveIndex(-1)
  }, [results])

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function goToResults(term) {
    const q = term.trim()
    if (!q) return
    navigate('/search?q=' + encodeURIComponent(q))
    setOpen(false)
    setFocused(false)
    onNavigate?.()
  }

  function goToProduct(product) {
    navigate('/products/' + product.id)
    setOpen(false)
    setFocused(false)
    onNavigate?.()
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (activeIndex >= 0 && results[activeIndex]) {
      goToProduct(results[activeIndex])
    } else {
      goToResults(query)
    }
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      e.currentTarget.blur()
    }
  }

  const showDropdown = open && focused && query.trim().length >= 2
  const isCompact = variant === 'compact'

  return (
    <div ref={rootRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        role="search"
        className={
          'group flex items-stretch bg-bone-50 border transition-avenzo ' +
          (isCompact ? 'rounded-full h-11 ' : 'rounded-full h-[52px] ') +
          (focused
            ? 'border-brass-400 shadow-focus-ring'
            : 'border-stone-300 hover:border-stone-400 shadow-subtle')
        }
      >
        <div className="flex items-center pl-4 sm:pl-5 text-charcoal-400">
          <Search className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
        </div>
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            setFocused(true)
            setOpen(true)
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={isCompact ? 'Search Avenzo' : 'Search for products, brands and inspiration'}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          className={
            'peer flex-1 min-w-0 bg-transparent px-3 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none ' +
            (isCompact ? 'text-sm' : 'font-display text-[1.05rem]')
          }
        />
        <button
          type="submit"
          aria-label="Search"
          className={
            'flex items-center justify-center flex-shrink-0 bg-charcoal-900 text-bone-50 transition-avenzo hover:bg-charcoal-800 rounded-full ' +
            (isCompact ? 'm-1 px-4 text-xs' : 'm-1.5 px-6 text-sm font-medium')
          }
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 bg-bone-50 border border-stone-200 rounded-xl shadow-popover overflow-hidden z-50 animate-scale-in origin-top"
        >
          {loading && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-charcoal-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-caption">Searching…</span>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center px-6">
              <PackageSearch className="w-6 h-6 text-charcoal-300" />
              <p className="text-body-sm text-charcoal-600">
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-caption">Try a different keyword or browse our full catalog.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul>
              {results.map((product, i) => (
                <li key={product.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToProduct(product)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-avenzo ' +
                      (i === activeIndex ? 'bg-stone-100' : 'hover:bg-stone-50')
                    }
                  >
                    <span className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-sm text-charcoal-900 truncate">
                        {product.title}
                      </span>
                      {product.brand && (
                        <span className="block text-caption truncate">{product.brand}</span>
                      )}
                    </span>
                    <span className="font-sans text-sm font-semibold text-charcoal-900 flex-shrink-0">
                      {formatPrice(product.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && (results.length > 0 || searched) && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToResults(query)}
              className="w-full flex items-center justify-between px-4 py-3 border-t border-stone-200 text-body-sm font-medium text-charcoal-800 hover:bg-stone-50 transition-avenzo"
            >
              See all results for &ldquo;{query.trim()}&rdquo;
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
