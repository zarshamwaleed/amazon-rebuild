import { MapPin } from 'lucide-react'

export default function LocationSelector() {
  return (
    <div className="hidden md:flex items-end gap-1 px-2 py-2 cursor-pointer border border-transparent hover:border-white rounded transition">
      <MapPin className="w-4 h-4 text-white mb-1" />
      <div className="text-white leading-tight">
        <div className="text-xs text-gray-300">Deliver to</div>
        <div className="text-sm font-bold">Pakistan</div>
      </div>
    </div>
  )
}
