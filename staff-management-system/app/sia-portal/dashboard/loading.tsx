export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-100">Loading SIA Portal...</h2>
        <p className="text-gray-400">Authenticating secure access...</p>
      </div>
    </div>
  )
}
