import { Link } from 'react-router-dom'

export default function CategoryCard({ category }) {
  if (!category) return null
  return (
    <Link
      to={'/category/' + category.slug}
      className="group bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {category.image_url && (
          <img
            src={category.image_url}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#c7511f]">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{category.description}</p>
        )}
      </div>
    </Link>
  )
}
