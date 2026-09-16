import { Link } from "react-router-dom";
import type { DiscoveryVerse } from "@/api/queries/discovery";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

export function DiscoveryVerseCard({ verse }: { verse: DiscoveryVerse }) {
  // Some responses might have nulls (e.g. verse not loaded in requested translation)
  if (
    !verse.book_slug ||
    verse.chapter == null ||
    verse.verse_number == null ||
    !verse.text_am
  ) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface-raised/10 p-4 opacity-60">
        <p className="font-amharic text-[13px] text-text-faint">ጥቅሱ አልተገኘም</p>
      </div>
    );
  }

  const ref = `${verse.book_name_am ?? verse.book_slug} ${toEthiopicNumeral(verse.chapter)}:${toEthiopicNumeral(verse.verse_number)}`;
  const preview =
    verse.text_am.length > 140
      ? verse.text_am.slice(0, 140).trim() + "…"
      : verse.text_am;

  return (
    <Link
      to={`/bible/${verse.book_slug}/${verse.chapter}?verse=${verse.verse_number}`}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised/20 p-4",
        "transition-colors hover:border-gold-500/30 hover:bg-surface-raised/40",
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wider text-gold-500/80">
        {ref}
      </span>
      <p className="font-amharic text-[14px] leading-[1.85] text-text-secondary">
        {preview}
      </p>
    </Link>
  );
}
