import { useState } from "react";
import { FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotes, useDeleteNote } from "@/api/queries/user";
import { LibraryVerseCard } from "./LibraryVerseCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

export function LibraryNotesTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useNotes({ page });
  const deleteMutation = useDeleteNote();

  const items = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) return <ListSkeleton />;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        titleAm="እስካሁን ማስታወሻ የለም"
        hintAm="ማስታወሻ ለመጻፍ በጥቅሱ ላይ የማስታወሻ ምልክቱን ይጫኑ።"
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
      <div className="grid grid-cols-1 gap-3">
        {items.map((n) => (
          <LibraryVerseCard
            key={n.id}
            bookSlug={n.book_slug}
            bookNameAm={n.book_name_am}
            chapter={n.chapter}
            verseNumber={n.verse_number}
            textAm={n.text_am}
            contentAm={n.content_am}
            contentLabel="ማስታወሻ"
            onDelete={() =>
              deleteMutation.mutate({ id: n.id, verseId: n.verse_id })
            }
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

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}
