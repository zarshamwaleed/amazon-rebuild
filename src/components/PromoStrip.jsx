import { Link } from 'react-router-dom'

export default function PromoStrip({ title, subtitle, cta, to }) {
  return (
    <div className="bg-[#37475a] text-white rounded-lg p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
        {subtitle && <p className="text-gray-300 text-sm mt-1">{subtitle}</p>}
      </div>
      {cta && to && (
        <Link
          to={to}
          className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-semibold px-5 py-2.5 rounded transition self-start md:self-auto whitespace-nowrap"
        >
          {cta}
        </Link>
      )}
    </div>
  )
}
