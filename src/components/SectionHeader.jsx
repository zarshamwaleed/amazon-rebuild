import { Link } from 'react-router-dom'

export default function SectionHeader({ title, seeMoreTo }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
      {seeMoreTo && (
        <Link to={seeMoreTo} className="text-sm text-blue-600 hover:text-[#c7511f] hover:underline">
          See more
        </Link>
      )}
    </div>
  )
}
