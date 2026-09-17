import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center px-2 py-2 border border-transparent hover:border-white rounded transition"
      aria-label="Amazon Rebuild home"
    >
      <span className="text-white text-2xl font-bold tracking-tight">amazon</span>
      <span className="text-[#ff9900] text-2xl font-bold tracking-tight -ml-0.5">.rebuild</span>
    </Link>
  )
}
