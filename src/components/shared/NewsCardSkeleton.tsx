// Server Component — PAS de "use client"
import { Skeleton } from '@/components/ui/skeleton'

export function NewsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5" aria-hidden="true">
      {/* Header auteur skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
      {/* Titre skeleton */}
      <Skeleton className="h-5 w-3/4 mb-3" />
      {/* Extrait skeleton */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}
