import { Link } from "react-router-dom";
import { BookOpen, Hash, ChevronRight } from "lucide-react";
import { useVerseReference } from "@/api/queries/search";
import { Skeleton } from "@/components/ui/Skeleton";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

export function ReferenceResults({ query }: { query: string }) {
  const { parsed, verses, isLoading, isError } = useVerseReference(query);

  if (!parsed) return null;

  // Book identifier for the header
  const bookLabel =
    verses[0]?.bookNameAm ??
    (parsed.kind === "verses"
      ? parsed.segments[0].bookQuery
      : parsed.range.bookQuery);

  return (
    <section className="mb-10">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gold-500/90">
          <BookOpen className="h-3.5 w-3.5" />
          <h2 className="font-amharic text-[13px] font-semibold uppercase tracking-wider">
            ቀጥታ ጥቅስ
          </h2>
        </div>
        {verses.length > 0 && (
          <span className="text-[11px] tabular-nums text-text-faint">
            {verses.length} ጥቅሶች
          </span>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-surface-border bg-surface-raised/20 p-4">
          <p className="font-amharic text-[13px] text-text-muted">
            የተጠየቀው ጥቅስ አልተገኘም — የ{bookLabel} አካል ያልሆነ ይሆናል።
          </p>
        </div>
      ) : verses.length === 0 ? (
        <div className="rounded-xl border border-surface-border bg-surface-raised/20 p-4">
          <p className="font-amharic text-[13px] text-text-muted">
            በዚህ ጥቅስ ምንም አልተገኘም።
          </p>
        </div>
      ) : (
        <div className="divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border">
          {verses.map((v, idx) => (
            <VerseRefRow
              key={`${v.bookSlug}-${v.chapter}-${v.verseNumber}-${idx}`}
              verse={v}
            />
          ))}
        </div>
      )}

      {parsed.kind === "verses" && parsed.segments.length > 1 && (
        <p className="mt-2 font-amharic text-[11px] text-text-faint">
          {parsed.segments.length} የተለያዩ ጥቅሶች ተጠይቀዋል።
        </p>
      )}
    </section>
  );
}

function VerseRefRow({
  verse,
}: {
  verse: {
    bookSlug: string;
    bookNameAm: string;
    chapter: number;
    verseNumber: number;
    verseNumberEthiopic: string | null;
    textAm: string;
    verseId: number;
  };
}) {
  const ref = `${verse.bookNameAm} ${toEthiopicNumeral(verse.chapter)}:${
    verse.verseNumberEthiopic ?? toEthiopicNumeral(verse.verseNumber)
  }`;

  return (
    <Link
      to={`/bible/${verse.bookSlug}/${verse.chapter}?verse=${verse.verseNumber}`}
      className={cn(
        "group flex items-start gap-4 px-4 py-4",
        "transition-colors hover:bg-surface-raised/40",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-1.5 font-amharic text-[12px] font-medium text-gold-500">
          {ref}
        </p>
        <p className="font-amharic text-[15px] leading-[1.9] text-text-primary">
          {verse.textAm}
        </p>
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-gold-500" />
    </Link>
  );
}
