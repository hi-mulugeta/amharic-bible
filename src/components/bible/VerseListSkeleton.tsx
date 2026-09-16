import { Skeleton } from "@/components/ui/Skeleton";
import { useReaderStore } from "@/stores/readerStore";
import { FONT_SIZE_CLASS } from "@/lib/fontSize";
import { cn } from "@/lib/utils";

/**
 * Loading skeleton for a chapter. Each skeleton verse matches the real
 * verse layout: number column, text line, optional badge row.
 */
export function VerseListSkeleton({ count = 12 }: { count?: number }) {
  const fontSize = useReaderStore((s) => s.fontSize);
  const sizeClass = FONT_SIZE_CLASS[fontSize];

  // Vary the text widths so the skeleton looks like real text, not a
  // uniform grid. The pattern repeats every 6 verses.
  const WIDTH_PATTERN = [100, 92, 88, 96, 84, 90];

  return (
    <div className="space-y-1" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const width = WIDTH_PATTERN[i % WIDTH_PATTERN.length];
        const hasBadge = i % 4 === 1; // Some verses show a badge skeleton

        return (
          <div key={i} className="flex gap-3 px-2 py-2 -mx-2">
            {/* Verse number column — matches .min-w-[1.75rem] of the real item */}
            <Skeleton className="mt-[7px] h-3 w-6 shrink-0" />

            <div className="flex-1 min-w-0">
              {/* Text line — height scales with the reader font size */}
              <div className="space-y-2">
                <Skeleton
                  className={cn("h-5 rounded", sizeClass)}
                  style={{ width: `${width}%` }}
                />
                {width < 96 && (
                  <Skeleton
                    className="h-5 rounded"
                    style={{ width: `${60 + ((i * 11) % 30)}%` }}
                  />
                )}
              </div>

              {/* Badge row skeleton */}
              {hasBadge && (
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
