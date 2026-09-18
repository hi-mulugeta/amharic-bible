import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { usePrayers, PRAYER_CATEGORIES } from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

export function LiturgyPrayersTab() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching } = usePrayers({ page, category });

  const prayers = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setCategory(undefined);
            setPage(1);
          }}
          className={cn(
            "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
            !category
              ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
              : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
          )}
        >
          ሁሉም
        </button>
        {PRAYER_CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setCategory(c.key);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
                active
                  ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                  : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
              )}
            >
              {c.label}
            </button>
          );
        })}
        {meta && (
          <span className="ml-2 text-[12px] tabular-nums text-text-faint">
            {meta.total}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : prayers.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          titleAm="ጸሎት አልተገኘም"
          hintAm={category ? "በዚህ ምድብ ጸሎት የለም።" : "እስካሁን ጸሎት አልተመዘገበም።"}
        />
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-1 gap-3 lg:grid-cols-2 transition-opacity",
              isFetching ? "opacity-60" : "opacity-100",
            )}
          >
            {prayers.map((p) => (
              <Link
                key={p.id}
                to={`/liturgy/prayers/${p.slug}`}
                className={cn(
                  "group flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised/20 p-5",
                  "transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40",
                )}
              >
                <h3 className="font-amharic text-[16px] font-semibold text-text-primary group-hover:text-gold-400 transition-colors">
                  {p.title_am}
                </h3>
                {p.title_en && (
                  <p className="text-[12px] text-text-muted truncate">
                    {p.title_en}
                  </p>
                )}
                {p.source_am && (
                  <p className="mt-auto font-amharic text-[12px] text-text-faint italic">
                    {p.source_am}
                  </p>
                )}
              </Link>
            ))}
          </div>
          {meta && meta.pages > 1 && (
            <div className="pt-4">
              <Pagination
                page={meta.page}
                totalPages={meta.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
