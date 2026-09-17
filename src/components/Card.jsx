export default function Card({ children, className = '' }) {
  return (
    <div className={'bg-white shadow-sm rounded-lg border border-gray-200 ' + className}>
      {children}
    </div>
  )
}
