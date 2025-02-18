export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2" />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-4 py-2 text-left">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-4 py-2 text-left">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-4 py-2 text-left">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="px-4 py-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 