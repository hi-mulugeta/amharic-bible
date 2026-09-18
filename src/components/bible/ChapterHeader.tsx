import { Link } from "react-router-dom";
import type { BookOut } from "@/api/queries/bible";
import { toEthiopicNumeral } from "@/lib/ethiopic";

type Props = {
  book: BookOut;
  chapter: number;
  chapterEthiopic: string | null;
  translationName: string;
};

export function ChapterHeader({
  book,
  chapter,
  chapterEthiopic,
  translationName,
}: Props) {
  const testamentLabel = book.testament === "NT" ? "አዲስ ኪዳን" : "ብሉይ ኪዳን";
  const chapterCount = book.total_chapters;
  const chapterLabel = chapterEthiopic ?? toEthiopicNumeral(chapter);
  const chapterCountLabel = toEthiopicNumeral(chapterCount);

  return (
    <header className="mb-8 border-b border-surface-border pb-6">
      <nav
        aria-label="አውድ"
        className="mb-3 flex items-center gap-2 font-amharic text-[12px] text-text-faint"
      >
        <span>{testamentLabel}</span>
        <span className="text-text-faint/50">·</span>
        <Link
          to={`/bible/${book.slug}/1`}
          className="transition-colors hover:text-text-muted"
        >
          {book.name_am}
        </Link>
        <span className="text-text-faint/50">·</span>
        <span className="tabular-nums">
          ምዕራፍ {chapterLabel} ከ {chapterCountLabel}
        </span>
      </nav>

      <div className="flex flex-wrap items-baseline gap-3">
        <Link
          to={`/bible/${book.slug}/1`}
          className="font-amharic text-[15px] font-medium text-gold-500 transition-colors hover:text-gold-400"
        >
          {book.name_am}
        </Link>
        <span className="text-sm text-text-faint">·</span>
        <span className="text-sm text-text-muted">{book.name_en}</span>
      </div>

      <h1 className="mt-2 font-amharic text-3xl font-semibold leading-tight text-text-primary md:text-4xl">
        ምዕራፍ{" "}
        <span className="ml-1 align-middle text-2xl text-gold-500/70 md:text-3xl">
          {chapterLabel}
        </span>
      </h1>

      <p className="mt-3 text-[11px] uppercase tracking-wider text-text-faint">
        {translationName}
      </p>
    </header>
  );
}
