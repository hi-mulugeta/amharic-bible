import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, MessageSquare } from "lucide-react";
import {
  useModerationQueue,
  useHideComment,
  useUnhideComment,
} from "@/api/queries/community";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

function relativeTime(iso: string): string {
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

export function AdminCommentsTab() {
  const [page, setPage] = useState(1);
  const [onlyHidden, setOnlyHidden] = useState(false);
  const { data, isLoading, isError, isFetching } = useModerationQueue({
    page,
    onlyHidden,
  });
  const hideMutation = useHideComment();
  const unhideMutation = useUnhideComment();

  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOnlyHidden(false);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
              !onlyHidden
                ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
            )}
          >
            ሁሉም
          </button>
          <button
            type="button"
            onClick={() => {
              setOnlyHidden(true);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 font-amharic text-[13px] transition-colors",
              onlyHidden
                ? "border-gold-500/40 bg-gold-500/15 text-gold-300"
                : "border-surface-border bg-surface-raised/20 text-text-secondary hover:text-text-primary",
            )}
          >
            የተደበቁ ብቻ
          </button>
          {meta && (
            <span className="ml-2 text-[12px] tabular-nums text-text-faint">
              {meta.total} አስተያየቶች
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="አስተያየቶችን መጫን አልተቻለም።" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MessageSquare />}
          titleAm={onlyHidden ? "የተደበቀ አስተያየት የለም" : "አስተያየት የለም"}
          hintAm="እስካሁን ምንም አስተያየት አልተመዘገበም።"
        />
      ) : (
        <>
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-surface-border transition-opacity",
              isFetching ? "opacity-60" : "opacity-100",
            )}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface-raised/20 text-left">
                  <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                    ደራሲ
                  </th>
                  <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                    አስተያየት
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                    ጥቅስ
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint sm:table-cell">
                    ጊዜ
                  </th>
                  <th className="w-[120px] px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((c) => (
                  <tr
                    key={c.id}
                    className={cn(
                      "transition-colors hover:bg-surface-raised/10",
                      c.is_hidden && "bg-red-500/[0.03]",
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-amharic text-[13px] text-text-primary">
                        {c.author?.display_name_am ?? c.author?.username ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="line-clamp-2 font-amharic text-[13px] leading-[1.7] text-text-secondary">
                        {c.content_am}
                      </p>
                      {c.is_hidden && (
                        <span className="mt-1 inline-block rounded-sm bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-red-400">
                          ተደብቋል
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <Link
                        to={`/bible/verses/${c.verse_id}`}
                        className="text-[12px] tabular-nums text-text-muted hover:text-gold-400"
                      >
                        #{c.verse_id}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-[12px] text-text-faint">
                        {relativeTime(c.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {c.is_hidden ? (
                          <button
                            type="button"
                            onClick={() => unhideMutation.mutate(c.id)}
                            disabled={unhideMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-amharic text-[12px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                          >
                            <Eye className="h-3 w-3" />
                            አሳይ
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => hideMutation.mutate(c.id)}
                            disabled={hideMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-amharic text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                          >
                            <EyeOff className="h-3 w-3" />
                            ደብቅ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        </>
      )}
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
