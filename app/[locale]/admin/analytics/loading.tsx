import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto py-10">
      <Skeleton className="h-10 w-64 mb-8" />
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Skeleton className="h-[200px]" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  )
} 