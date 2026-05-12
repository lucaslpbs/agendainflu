import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonCard } from "@/components/ui/SkeletonCard"

interface SkeletonDashboardProps {
  cardCount?: number
  cardCols?: string
}

export function SkeletonDashboard({
  cardCount = 4,
  cardCols = "grid sm:grid-cols-2 lg:grid-cols-4 gap-4",
}: SkeletonDashboardProps) {
  return (
    <div className="space-y-8">
      <div className={cardCols}>
        {Array.from({ length: cardCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <Skeleton className="h-5 w-48 mb-6" />
          <Skeleton className="h-60 w-full" />
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <Skeleton className="h-5 w-24 mb-6" />
          <Skeleton className="h-44 w-full" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <Skeleton className="h-5 w-44 mb-4" />
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 gap-4">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
