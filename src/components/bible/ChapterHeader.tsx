import { Link } from "react-router-dom";
import type { BookOut } from "@/api/queries/bible";

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
  return (
    <header className="border-b border-surface-border pb-5 mb-8">
      <div className="flex items-baseline gap-3 flex-wrap">
        <Link
          to={`/bible/${book.slug}/1`}
          className="font-amharic text-[15px] font-medium text-gold-500 hover:text-gold-400 transition-colors"
        >
          {book.name_am}
        </Link>
        <span className="text-text-faint text-sm">·</span>
        <span className="text-text-muted text-sm">{book.name_en}</span>
      </div>
      <h1 className="mt-2 font-amharic text-3xl md:text-4xl font-semibold text-text-primary leading-tight">
        ምዕራፍ{" "}
        <span className="text-gold-500/70 ml-1 text-2xl md:text-3xl align-middle">
          {chapterEthiopic ?? chapter}
        </span>
      </h1>
      <p className="mt-3 text-xs text-text-faint">{translationName}</p>
    </header>
  );
}
