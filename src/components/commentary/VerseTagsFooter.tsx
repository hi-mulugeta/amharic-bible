import { Link } from "react-router-dom";
import { Hash } from "lucide-react";
import { useVerseTags } from "@/api/queries/discovery";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

type Props = {
  bookSlug: string | null | undefined;
  chapter: number | null | undefined;
  verseNumber: number | null | undefined;
};

export function VerseTagsFooter({ bookSlug, chapter, verseNumber }: Props) {
  const { data, isLoading } = useVerseTags(bookSlug, chapter, verseNumber);

  // Completely hidden when there's nothing to show.
  // (No "no tags" message — silence is the right default here.)
  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <footer className="border-t border-surface-border px-5 py-4">
      <div className="mb-2 flex items-center gap-2 text-text-faint">
        <Hash className="h-3 w-3" />
        <span className="font-amharic text-[11px] uppercase tracking-wider">
          መለያዎች
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {data!.map((tag) => (
            <li key={tag.slug}>
              <Link
                to={`/tags/${tag.slug}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1",
                  "bg-surface-raised text-text-secondary",
                  "transition-colors hover:bg-surface-raised/80 hover:text-text-primary",
                  "font-amharic text-[13px]",
                )}
              >
                <Hash className="h-3 w-3 text-text-faint" />
                {tag.name_am}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </footer>
  );
}
