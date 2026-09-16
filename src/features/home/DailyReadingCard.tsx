import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, BookOpen } from "lucide-react";
import {
  useDailyReading,
  type ReadingBlock,
  type ReadingVerse,
} from "@/api/queries/liturgy";
import { Skeleton } from "@/components/ui/Skeleton";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";
import { ReadingVerseItem } from "./ReadingVerseItem";
import { CommentaryPanel } from "@/components/commentary/CommentaryPanel";

/**
 * A verse plus its parent reference. We need the book slug and chapter
 * to fetch the verse's tags and open the commentary panel correctly.
 */
type SelectedReadingVerse = {
  verse: ReadingVerse;
  bookSlug: string;
  bookNameAm: string;
  chapter: number;
};

export function DailyReadingCard() {
  const { data, isLoading } = useDailyReading();
  const [selected, setSelected] = useState<SelectedReadingVerse | null>(null);

  if (isLoading) {
    return (
      <section className="rounded-xl border border-surface-border bg-surface-raised/20 p-5">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-9 w-full mb-2" />
        <Skeleton className="h-9 w-full" />
      </section>
    );
  }

  const readings = Array.isArray(data?.readings) ? data!.readings : [];
  if (!data || readings.length === 0) return null;

  return (
    <>
      <section>
        <header className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold-500/70" />
            <h2 className="font-amharic text-[15px] font-semibold text-text-primary">
              {data.title_am ?? "የዕለቱ ምንባብ"}
            </h2>
          </div>
          <p className="font-amharic text-[12px] text-text-faint">
            {data.ethiopian_month_name} {toEthiopicNumeral(data.ethiopian_day)}
          </p>
        </header>

        {data.description_am && (
          <p className="mb-4 font-amharic text-[14px] text-text-muted">
            {data.description_am}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised/20 divide-y divide-surface-border">
          {readings.map((block, i) => (
            <ReadingRow
              key={i}
              block={block}
              selectedVerseId={selected?.verse.id ?? null}
              onSelectVerse={(payload) => setSelected(payload)}
            />
          ))}
        </div>
      </section>

      {selected && (
        <CommentarySheet payload={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function ReadingRow({
  block,
  selectedVerseId,
  onSelectVerse,
}: {
  block: ReadingBlock;
  selectedVerseId: number | null;
  onSelectVerse: (payload: SelectedReadingVerse) => void;
}) {
  const [open, setOpen] = useState(false);

  const label = `${block.book_name_am} ${block.chapter_ethiopic}:${block.start_ethiopic}${
    block.start !== block.end ? `-${block.end_ethiopic}` : ""
  }`;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised/40"
      >
        <span className="rounded-sm bg-gold-500/15 px-1.5 py-0.5 font-amharic text-[10px] font-medium uppercase tracking-wider text-gold-400">
          {block.kind}
        </span>
        <span className="font-amharic text-[14px] text-text-primary">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 text-text-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="animate-fade-in bg-stone-950/50 px-4 pb-4 pt-1">
          <div className="space-y-1">
            {block.verses.map((v) => (
              <ReadingVerseItem
                key={v.id}
                verse={v}
                isSelected={v.id === selectedVerseId}
                onSelect={(verse) =>
                  onSelectVerse({
                    verse,
                    bookSlug: block.book_slug,
                    bookNameAm: block.book_name_am,
                    chapter: block.chapter,
                  })
                }
              />
            ))}
          </div>
          <Link
            to={`/bible/${block.book_slug}/${block.chapter}`}
            className="mt-4 inline-flex font-amharic text-[13px] font-medium text-gold-500 hover:text-gold-400 transition-colors"
          >
            በአንባቢው ውስጥ ክፈት →
          </Link>
        </div>
      )}
    </div>
  );
}

function CommentarySheet({
  payload,
  onClose,
}: {
  payload: SelectedReadingVerse;
  onClose: () => void;
}) {
  const { verse, bookSlug, bookNameAm, chapter } = payload;

  // Pass a fully-formed verse to the panel — including book + chapter —
  // so the tag footer can fetch and render.
  const verseForPanel = {
    id: verse.id,
    verse_number: verse.verse_number,
    verse_number_ethiopic: verse.verse_number_ethiopic,
    book: bookSlug,
    book_name_am: bookNameAm,
    chapter,
    text_am: verse.text_am,
    commentary_count: verse.commentary_count ?? null,
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="ዝጋ"
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm animate-fade-in"
      />

      <div className="relative z-10 h-full w-full max-w-md border-l border-surface-border bg-stone-950 shadow-2xl animate-slide-up lg:max-w-[440px]">
        <CommentaryPanel verse={verseForPanel} onClose={onClose} />
      </div>
    </div>
  );
}
