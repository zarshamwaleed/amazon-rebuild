import { useEffect, useState } from 'react'
import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react'

const PRICE_BUCKETS = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 to $50', min: 25, max: 50 },
  { label: '$50 to $100', min: 50, max: 100 },
  { label: '$100 to $200', min: 100, max: 200 },
  { label: '$200 & Above', min: 200, max: undefined },
]

function Checkbox({ checked, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2.5 w-full text-left py-1.5"
    >
      <span
        className={
          'flex-shrink-0 w-[18px] h-[18px] rounded-md border flex items-center justify-center transition-avenzo ' +
          (checked
            ? 'bg-charcoal-900 border-charcoal-900'
            : 'border-stone-300 bg-bone-50 group-hover:border-stone-400')
        }
      >
        {checked && <Check className="w-3 h-3 text-bone-50" strokeWidth={3} />}
      </span>
      <span
        className={
          'text-av-body-sm transition-avenzo ' +
          (checked ? 'text-charcoal-900 font-medium' : 'text-charcoal-600 group-hover:text-charcoal-900')
        }
      >
        {label}
      </span>
    </button>
  )
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-stone-200 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-2.5"
      >
        <h3 className="text-label">{title}</h3>
        <ChevronDown
          className={'w-3.5 h-3.5 text-charcoal-400 transition-transform duration-base ' + (open ? 'rotate-180' : '')}
        />
      </button>
      {open && <div className="animate-fade-in">{children}</div>}
    </div>
  )
}

function PriceRangeInputs({ minPrice, maxPrice, onPriceChange }) {
  const [min, setMin] = useState(minPrice ?? '')
  const [max, setMax] = useState(maxPrice ?? '')

  useEffect(() => {
    setMin(minPrice ?? '')
    setMax(maxPrice ?? '')
  }, [minPrice, maxPrice])

  function apply() {
    onPriceChange({
      min: min === '' ? undefined : Number(min),
      max: max === '' ? undefined : Number(max),
    })
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="relative flex-1">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-av-caption text-charcoal-400">$</span>
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          placeholder="Min"
          className="w-full rounded-lg border border-stone-300 bg-bone-50 pl-5 pr-2 py-1.5 text-av-body-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400"
        />
      </div>
      <span className="text-charcoal-300 text-av-body-sm">—</span>
      <div className="relative flex-1">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-av-caption text-charcoal-400">$</span>
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          placeholder="Max"
          className="w-full rounded-lg border border-stone-300 bg-bone-50 pl-5 pr-2 py-1.5 text-av-body-sm text-charcoal-900 placeholder:text-charcoal-400 transition-avenzo focus:outline-none focus:border-brass-400"
        />
      </div>
      <button
        type="button"
        onClick={apply}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-charcoal-900 text-bone-50 text-av-caption font-semibold hover:bg-charcoal-800 transition-avenzo"
      >
        Go
      </button>
    </div>
  )
}

function FilterContent({
  categories,
  activeCategoryId,
  onCategoryChange,
  showCategoryFilter,
  minPrice,
  maxPrice,
  onPriceChange,
}) {
  return (
    <>
      {showCategoryFilter && (
        <Section title="Category">
          <Checkbox
            checked={!activeCategoryId}
            label="All Categories"
            onClick={() => onCategoryChange && onCategoryChange(null)}
          />
          {categories.map((c) => (
            <Checkbox
              key={c.id}
              checked={activeCategoryId === c.id}
              label={c.name}
              onClick={() => onCategoryChange && onCategoryChange(c)}
            />
          ))}
        </Section>
      )}

      <Section title="Price">
        {PRICE_BUCKETS.map((b) => {
          const active = minPrice === b.min && maxPrice === b.max
          return (
            <Checkbox
              key={b.label}
              checked={active}
              label={b.label}
              onClick={() => onPriceChange && onPriceChange(active ? {} : { min: b.min, max: b.max })}
            />
          )
        })}
        <PriceRangeInputs minPrice={minPrice} maxPrice={maxPrice} onPriceChange={onPriceChange} />
      </Section>
    </>
  )
}

export default function FilterSidebar({
  categories = [],
  activeCategoryId,
  onCategoryChange,
  showCategoryFilter = true,
  minPrice,
  maxPrice,
  onPriceChange,
  onClear,
  resultCount,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const activeCategory = categories.find((c) => c.id === activeCategoryId)
  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined
  const chips = []
  if (activeCategory) {
    chips.push({
      key: 'category',
      label: activeCategory.name,
      onRemove: () => onCategoryChange && onCategoryChange(null),
    })
  }
  if (hasPriceFilter) {
    const label =
      minPrice !== undefined && maxPrice !== undefined
        ? `$${minPrice} – $${maxPrice}`
        : minPrice !== undefined
        ? `$${minPrice}+`
        : `Up to $${maxPrice}`
    chips.push({ key: 'price', label, onRemove: () => onPriceChange && onPriceChange({}) })
  }
  const activeCount = chips.length

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-300 bg-bone-50 text-av-body-sm font-medium text-charcoal-800 hover:border-stone-400 transition-avenzo"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-charcoal-900 text-bone-50 text-[0.65rem] font-semibold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-40">
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-brass-50 border border-brass-200 text-av-caption font-medium text-brass-700 hover:bg-brass-100 transition-avenzo"
                >
                  {chip.label}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          <FilterContent
            categories={categories}
            activeCategoryId={activeCategoryId}
            onCategoryChange={onCategoryChange}
            showCategoryFilter={showCategoryFilter}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={onPriceChange}
          />

          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="mt-5 text-av-body-sm font-medium text-charcoal-500 hover:text-brass-700 transition-avenzo underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={'lg:hidden fixed inset-0 z-[60] ' + (drawerOpen ? 'visible' : 'invisible pointer-events-none')}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={
            'absolute inset-0 bg-charcoal-900 transition-opacity duration-slow ease-avenzo-out ' +
            (drawerOpen ? 'opacity-40' : 'opacity-0')
          }
        />
        <aside
          className={
            'absolute right-0 top-0 bg-bone-50 w-[85vw] max-w-sm h-full shadow-lifted flex flex-col transition-transform duration-slow ease-avenzo-out ' +
            (drawerOpen ? 'translate-x-0' : 'translate-x-full')
          }
          aria-label="Filters"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
            <span className="heading-sub">Filters</span>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              className="p-2 rounded-full hover:bg-stone-100 transition-avenzo"
            >
              <X className="w-5 h-5 text-charcoal-800" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4">
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-brass-50 border border-brass-200 text-av-caption font-medium text-brass-700 hover:bg-brass-100 transition-avenzo"
                  >
                    {chip.label}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            <FilterContent
              categories={categories}
              activeCategoryId={activeCategoryId}
              onCategoryChange={onCategoryChange}
              showCategoryFilter={showCategoryFilter}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={onPriceChange}
            />
          </div>

          <div className="flex-shrink-0 border-t border-stone-200 p-4 flex items-center gap-3">
            {activeCount > 0 && (
              <button
                onClick={onClear}
                className="text-av-body-sm font-medium text-charcoal-500 hover:text-brass-700 transition-avenzo"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex-1 bg-charcoal-900 text-bone-50 text-sm font-medium py-2.5 rounded-full hover:bg-charcoal-800 transition-avenzo"
            >
              {typeof resultCount === 'number' ? `Show ${resultCount} results` : 'Show results'}
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
