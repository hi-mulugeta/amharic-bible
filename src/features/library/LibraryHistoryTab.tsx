import { useState } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, ChevronRight, ArrowRight } from "lucide-react";
import { useHistory } from "@/api/queries/user";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
// import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

export function LibraryHistoryTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useHistory({ page });

  const items = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) return <ListSkeleton />;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<HistoryIcon />}
        titleAm="እስካሁን የንባብ ታሪክ የለም"
        hintAm="ምዕራፍ ማንበብ ሲጀምሩ ታሪኩ በራስ-ሰር ይመዘገባል።"
        action={
          <Link
            to="/bible/matthew/1"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 font-amharic text-[14px] font-medium text-stone-950 transition-colors hover:bg-gold-400"
          >
            ማንበብ ጀምር
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
    );
  }

  return (
    <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
      <ul className="space-y-1">
        {items.map((h) => {
          if (!h.book_slug) return null;
          const chapter = h.chapter;
          const lastSeen = formatRelativeTime(h.last_seen_at);

          return (
            <li key={h.id}>
              <Link
                to={`/bible/${h.book_slug}/${h.chapter}`}
                className={cn(
                  "group flex items-center gap-4 rounded-xl px-4 py-3 -mx-2",
                  "transition-colors hover:bg-surface-raised/40",
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-raised text-gold-500/80 ring-1 ring-gold-500/20">
                  <HistoryIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-amharic text-[15px] text-text-primary">
                    {h.book_name_am ?? h.book_slug} {chapter}
                  </p>
                  <p className="mt-0.5 font-amharic text-[12px] text-text-muted">
                    {lastSeen}
                    {h.visit_count > 1 && (
                      <>
                        {" · "}
                        {h.visit_count} ጊዜ ተነብቧል
                      </>
                    )}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-gold-500" />
              </Link>
            </li>
          );
        })}
      </ul>
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

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);

  if (diffMin < 1) return "አሁን";
  if (diffMin < 60) return `ከ ${diffMin} ደቂቃ በፊት`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `ከ ${diffHr} ሰዓት በፊት`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `ከ ${diffDay} ቀን በፊት`;
  return new Date(iso).toLocaleDateString();
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
