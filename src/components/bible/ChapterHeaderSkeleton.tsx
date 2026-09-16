import { Skeleton } from "@/components/ui/Skeleton";

export function ChapterHeaderSkeleton() {
  return (
    <header className="border-b border-surface-border pb-6 mb-8">
      {/* Context line skeleton */}
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-1" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-1" />
        <Skeleton className="h-3 w-28" />
      </div>

      {/* Book name row skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-1" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Title skeleton — must match the h1 height */}
      <div className="mt-2 flex items-baseline gap-2">
        <Skeleton className="h-9 w-24 md:h-10" />
        <Skeleton className="h-7 w-8 md:h-8" />
      </div>

      {/* Translation label skeleton */}
      <Skeleton className="mt-3 h-3 w-28" />
    </header>
  );
}
