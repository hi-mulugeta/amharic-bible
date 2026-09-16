import { useState } from "react";
import { Bookmark, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookmarks, useDeleteBookmark } from "@/api/queries/user";
import { LibraryVerseCard } from "./LibraryVerseCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

export function LibraryBookmarksTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useBookmarks({ page });
  const deleteMutation = useDeleteBookmark();

  const items = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) return <ListSkeleton />;
  if (items.length === 0) return <EmptyStateWithCTA kind="bookmarks" />;

  return (
    <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.map((b) => (
          <LibraryVerseCard
            key={b.id}
            bookSlug={b.book_slug}
            bookNameAm={b.book_name_am}
            chapter={b.chapter}
            verseNumber={b.verse_number}
            textAm={b.text_am}
            contentAm={b.note_am}
            contentLabel={b.note_am ? "የግል ማስታወሻ" : undefined}
            onDelete={() => deleteMutation.mutate(b.id)}
            deleting={deleteMutation.isPending}
          />
        ))}
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

function EmptyStateWithCTA({ kind }: { kind: "bookmarks" }) {
  return (
    <EmptyState
      icon={<Bookmark />}
      titleAm="እስካሁን ቅጥል የለም"
      hintAm="የሚወዱትን ጥቅስ ለማስቀመጥ በጥቅሱ ላይ የቅጥል ምልክቱን ይጫኑ።"
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

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}
