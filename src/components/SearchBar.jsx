import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    const params = new URLSearchParams({ q })
    if (category !== 'all') params.set('category', category)
    navigate('/search?' + params.toString())
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex items-stretch rounded overflow-hidden focus-within:ring-2 focus-within:ring-[#ff9900]"
      role="search"
    >
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="hidden md:block bg-gray-100 text-gray-700 text-sm px-2 border-r border-gray-300 focus:outline-none cursor-pointer"
        aria-label="Search category"
      >
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
        <option value="home-kitchen">Home & Kitchen</option>
        <option value="fashion">Fashion</option>
        <option value="sports-outdoors">Sports</option>
        <option value="toys-games">Toys</option>
      </select>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Amazon Rebuild"
        className="flex-1 px-3 py-2 text-sm text-gray-900 focus:outline-none"
      />
      <button
        type="submit"
        className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center transition"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-gray-900" />
      </button>
    </form>
  )
}
