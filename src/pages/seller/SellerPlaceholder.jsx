export default function SellerPlaceholder({ title, note }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-600">
        {note || 'This page will be built in a later module.'}
      </p>
    </div>
  )
}