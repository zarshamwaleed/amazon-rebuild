export default function SortDropdown({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700 whitespace-nowrap">Sort by:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
      >
        <option value="newest">Newest arrivals</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Avg. Customer Review</option>
      </select>
    </div>
  )
}
