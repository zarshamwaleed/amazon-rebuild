import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="py-20 md:py-28 flex flex-col items-center text-center">
      <div className="mb-6 w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
        <Compass className="w-6 h-6 text-charcoal-400" strokeWidth={1.5} />
      </div>
      <p className="text-label mb-2 text-brass-600">Error 404</p>
      <h1 className="font-display text-display-sm md:text-display text-charcoal-900 mb-3">
        This page has wandered off
      </h1>
      <p className="text-body-lg max-w-sm mb-8">
        We couldn&apos;t find the page you were looking for. It may have moved or no longer exists.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}
