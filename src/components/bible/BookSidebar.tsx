import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooks, useGroupedBooks, type BookOut } from "@/api/queries/bible";
import { Skeleton } from "@/components/ui/Skeleton";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { useReaderStore, type TestamentFilter } from "@/stores/readerStore";

type Props = {
  currentSlug?: string;
  currentChapter?: number;
  onNavigate?: () => void;
};

const TABS: Array<{ key: TestamentFilter; label: string }> = [
  { key: "OT", label: "ብሉይ" },
  { key: "NT", label: "አዲስ" },
  { key: "ALL", label: "ሁሉም" },
];

export function BookSidebar({
  currentSlug,
  currentChapter,
  onNavigate,
}: Props) {
  const { sidebarTestament, setSidebarTestament } = useReaderStore();

  const otQuery = useBooks("OT");
  const ntQuery = useBooks("NT");
  const grouped = useGroupedBooks();

  const counts = useMemo(
    () => ({
      OT: otQuery.data?.length ?? 0,
      NT: ntQuery.data?.length ?? 0,
      ALL: grouped.data?.length ?? 0,
    }),
    [otQuery.data, ntQuery.data, grouped.data],
  );

  const isLoading =
    sidebarTestament === "OT"
      ? otQuery.isLoading
      : sidebarTestament === "NT"
        ? ntQuery.isLoading
        : grouped.isLoading;

  return (
    <div className="flex h-full flex-col bg-stone-950">
      {/* Tabs */}
      <div className="border-b border-surface-border p-3">
        <div
          role="tablist"
          aria-label="ኪዳን ይምረጡ"
          className="grid grid-cols-3 gap-1"
        >
          {TABS.map((tab) => {
            const active = sidebarTestament === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => setSidebarTestament(tab.key)}
                className={cn(
                  "flex flex-col items-center rounded-md py-2 transition-colors duration-150",
                  active
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-secondary hover:bg-surface-raised/60 hover:text-text-primary",
                )}
              >
                <span className="font-amharic text-[15px] font-medium leading-none">
                  {tab.label}
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10px] tabular-nums leading-none",
                    active ? "text-gold-500" : "text-text-faint",
                  )}
                >
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <nav
        key={sidebarTestament}
        className="flex-1 overflow-y-auto py-2 animate-fade-in"
      >
        {isLoading ? (
          <div className="space-y-1 px-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : sidebarTestament === "ALL" ? (
          <>
            <SectionHeader label="ብሉይ ኪዳን" count={grouped.groups.OT.length} />
            {grouped.groups.OT.map((b) => (
              <BookRow
                key={b.slug}
                book={b}
                currentSlug={currentSlug}
                currentChapter={currentChapter}
                onNavigate={onNavigate}
              />
            ))}

            {grouped.groups.DEUTERO.length > 0 && (
              <>
                <SectionHeader
                  label="ዲዩትሮካኖኒካል"
                  count={grouped.groups.DEUTERO.length}
                />
                {grouped.groups.DEUTERO.map((b) => (
                  <BookRow
                    key={b.slug}
                    book={b}
                    currentSlug={currentSlug}
                    currentChapter={currentChapter}
                    onNavigate={onNavigate}
                  />
                ))}
              </>
            )}

            <SectionHeader label="አዲስ ኪዳን" count={grouped.groups.NT.length} />
            {grouped.groups.NT.map((b) => (
              <BookRow
                key={b.slug}
                book={b}
                currentSlug={currentSlug}
                currentChapter={currentChapter}
                onNavigate={onNavigate}
              />
            ))}
          </>
        ) : (
          (sidebarTestament === "OT" ? otQuery.data : ntQuery.data)?.map(
            (b) => (
              <BookRow
                key={b.slug}
                book={b}
                currentSlug={currentSlug}
                currentChapter={currentChapter}
                onNavigate={onNavigate}
              />
            ),
          )
        )}
      </nav>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-stone-950/95 px-4 py-2 backdrop-blur">
      <span className="font-amharic text-[11px] font-medium uppercase tracking-wider text-text-faint">
        {label}
      </span>
      <span className="text-[10px] tabular-nums text-text-faint">{count}</span>
    </div>
  );
}

/**
 * A book row. Clicking the label toggles the chapter grid;
 * clicking a chapter navigates directly.
 */
function BookRow({
  book,
  currentSlug,
  currentChapter,
  onNavigate,
}: {
  book: BookOut;
  currentSlug?: string;
  currentChapter?: number;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const { expandedBookSlug, setExpandedBook } = useReaderStore();
  const isExpanded = expandedBookSlug === book.slug;
  const isCurrentBook = book.slug === currentSlug;

  const handleToggle = () => {
    setExpandedBook(isExpanded ? null : book.slug);
  };

  return (
    <div className="border-b border-surface-border/40 last:border-b-0">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        className={cn(
          "group flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] transition-colors",
          "border-l-2 border-transparent",
          isCurrentBook
            ? "border-gold-500 bg-surface-raised/60 text-text-primary"
            : "text-text-secondary hover:bg-surface-raised/60 hover:text-text-primary",
        )}
      >
        <span
          className={cn(
            "w-6 shrink-0 text-right text-xs tabular-nums transition-colors",
            isCurrentBook ? "text-gold-500" : "text-text-faint",
          )}
        >
          {book.position}
        </span>
        <span className="font-amharic truncate">{book.name_am}</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-[11px] tabular-nums text-text-faint">
            {book.total_chapters}
          </span>
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-text-faint transition-transform duration-200",
              isExpanded && "rotate-90",
            )}
          />
        </span>
      </button>

      {isExpanded && (
        <div className="animate-fade-in bg-stone-950/60 px-3 pb-3 pt-1">
          <ChapterGrid
            book={book}
            currentChapter={isCurrentBook ? currentChapter : undefined}
            onPick={(chapter) => {
              navigate(`/bible/${book.slug}/${chapter}`);
              onNavigate?.();
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Compact chapter grid. Column count scales with container:
 * 6 columns when narrow, 8 when the sidebar is wide enough.
 * For very long books (>60 chapters, e.g. Psalms) we chunk into ranges.
 */
function ChapterGrid({
  book,
  currentChapter,
  onPick,
}: {
  book: BookOut;
  currentChapter?: number;
  onPick: (chapter: number) => void;
}) {
  const chapters = Array.from({ length: book.total_chapters }, (_, i) => i + 1);

  // Chunk huge books for readability
  const CHUNK = 150;
  const chunks: number[][] = [];
  for (let i = 0; i < chapters.length; i += CHUNK) {
    chunks.push(chapters.slice(i, i + CHUNK));
  }

  return (
    <div className="space-y-3">
      {chunks.map((chunk, ci) => (
        <div key={ci}>
          {chunks.length > 1 && (
            <p className="mb-2 font-amharic text-[10px] uppercase tracking-wider text-text-faint">
              {chunk[0]}–{chunk[chunk.length - 1]}
            </p>
          )}
          <div className="grid grid-cols-6 gap-1.5">
            {chunk.map((c) => {
              const active = c === currentChapter;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onPick(c)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium tabular-nums transition-all duration-150",
                    active
                      ? "bg-gold-500 text-stone-950 ring-2 ring-gold-500/40"
                      : "text-text-muted hover:bg-surface-raised hover:text-text-primary",
                  )}
                >
                  {toEthiopicNumeral(c)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
