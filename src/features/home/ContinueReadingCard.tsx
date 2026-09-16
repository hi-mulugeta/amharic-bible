import { Link } from "react-router-dom";
import { ArrowRight, BookMarked } from "lucide-react";
import { useContinueReading } from "@/api/queries/user";
import { toEthiopicNumeral } from "@/lib/ethiopic";

/**
 * Renders only when there's history to continue.
 * Until auth is wired, `enabled` stays false and the query never fires.
 */
export function ContinueReadingCard() {
  const { data, isLoading } = useContinueReading();

  // Silent when there's nothing to continue
  if (isLoading || !data || !data.book_slug) return null;

  return (
    <section>
      <Link
        to={`/bible/${data.book_slug}/${data.chapter}`}
        className="group flex items-center gap-4 rounded-xl border border-surface-border bg-surface-raised/20 px-4 py-3 transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-500/80 ring-1 ring-gold-500/20">
          <BookMarked className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-text-faint">
            ቀጥል
          </p>
          <p className="mt-0.5 font-amharic text-[15px] text-text-primary">
            {data.book_name_am} {toEthiopicNumeral(data.chapter)}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-gold-500" />
      </Link>
    </section>
  );
}
