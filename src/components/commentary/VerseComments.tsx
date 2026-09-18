import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useComments } from "@/api/queries/community";
import { CommentCard } from "./CommentCard";
import { CommentComposer } from "./CommentComposer";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function VerseComments({ verseId }: { verseId: number }) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError } = useComments(expanded ? verseId : null);

  const comments = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  // Collapsed state — a single line + count
  if (!expanded) {
    return (
      <section className="border-t border-surface-border px-5 py-4">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-between gap-3 text-left transition-colors hover:text-gold-400"
        >
          <div className="flex items-center gap-2 text-text-muted">
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="font-amharic text-[13px] font-medium">
              የሕዝብ አስተያየቶች
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-amharic text-[12px] text-text-faint">
              ይመልከቱ
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-text-faint" />
          </div>
        </button>
      </section>
    );
  }

  return (
    <section className="border-t border-surface-border px-5 py-4 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gold-500/80">
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="font-amharic text-[13px] font-medium">
            የሕዝብ አስተያየቶች
          </span>
          {total > 0 && (
            <span className="text-[11px] tabular-nums text-text-faint">
              {total}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="font-amharic text-[12px] text-text-faint transition-colors hover:text-text-muted"
        >
          ደብቅ
        </button>
      </header>

      {/* Composer */}
      <CommentComposer verseId={verseId} />

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-4 text-center font-amharic text-[13px] text-text-muted">
          አስተያየቶችን መጫን አልተቻለም
        </p>
      ) : comments.length === 0 ? (
        <p className="py-4 text-center font-amharic text-[13px] text-text-faint">
          እስካሁን አስተያየት የለም። የመጀመሪያው ይሁኑ።
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentCard key={c.id} comment={c} />
          ))}
        </div>
      )}
    </section>
  );
}
