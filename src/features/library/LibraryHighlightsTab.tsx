import { useState } from "react";
import { Highlighter, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useHighlights, useDeleteHighlight } from "@/api/queries/user";
import { LibraryVerseCard } from "./LibraryVerseCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
// import { toEthiopicNumeral } from "@/lib/ethiopic";
import { highlightTextColor } from "@/lib/highlightColors";

export function LibraryHighlightsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useHighlights({ page });
  const deleteMutation = useDeleteHighlight();

  const items = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) return <ListSkeleton />;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Highlighter />}
        titleAm="እስካሁን አድማሚ የለም"
        hintAm="ጥቅስን ለማድመቅ በጥቅሱ ላይ የአድማሚ ምልክቱን ይጫኑ።"
        action={
          <Link
            to="/bible/matthew/1"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 font-amharic text-[14px] font-medium text-stone-950 transition-colors hover:bg-gold-400"
          >
            ወደ መጽሐፍ ቅዱስ ተመለስ
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
    );
  }

  return (
    <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.map((h) => {
          const rangeLabel =
            h.start_verse === h.end_verse
              ? `ቁጥር ${h.start_verse}`
              : `ቁጥር ${h.start_verse}–${h.end_verse}`;

          return (
            <LibraryVerseCard
              key={h.id}
              bookSlug={h.book_slug}
              bookNameAm={h.book_name_am}
              chapter={h.chapter}
              verseNumber={h.start_verse}
              textAm={null}
              contentAm={rangeLabel}
              contentLabel="የተደመቀው ክልል"
              textColor={highlightTextColor(h.color)}
              onDelete={() => deleteMutation.mutate(h.id)}
              deleting={deleteMutation.isPending}
            />
          );
        })}
      </div>
      {meta && meta.pages > 1 && (
        <div className="mt-8">
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}
