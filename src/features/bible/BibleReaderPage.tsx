import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useChapter, useNavigation, type VerseOut } from "@/api/queries/bible";
import { useHighlightsForChapter, useNotes } from "@/api/queries/user";
import { BookSidebar } from "@/components/bible/BookSidebar";
import { ChapterHeader } from "@/components/bible/ChapterHeader";
import { VerseList } from "@/components/bible/VerseList";
import { ChapterNavigation } from "@/components/bible/ChapterNavigation";
import { CommentaryPanel } from "@/components/commentary/CommentaryPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { useReaderStore } from "@/stores/readerStore";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/utils";
import { request } from "@/api/client";
import { ChapterHeaderSkeleton } from "@/components/bible/ChapterHeaderSkeleton";
import { VerseListSkeleton } from "@/components/bible/VerseListSkeleton";
import { useChapterAudio } from "@/api/queries/audio";
import { AudioPlayer } from "@/components/audio/AudioPlayer";

export function BibleReaderPage() {
  const { book: bookSlug = "matthew", chapter: chapterStr = "1" } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const targetVerseNumber = (() => {
    const raw = searchParams.get("verse");
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  const chapter = Number(chapterStr) || 1;

  const { translationCode } = useReaderStore();
  const { selectedVerseId, selectVerse, commentaryOpen, setCommentaryOpen } =
    useReaderStore();
  const { isAuthenticated } = useAuth();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Numeric-slug redirect
  useEffect(() => {
    if (!/^\d+$/.test(bookSlug)) return;
    const verseId = Number(bookSlug);
    request<{ book: string | null; chapter: number }>(
      `/api/bible/verses/${verseId}`,
    )
      .then((v) => {
        if (v?.book && v?.chapter) {
          navigate(`/bible/${v.book}/${v.chapter}`, { replace: true });
        } else {
          navigate("/bible/matthew/1", { replace: true });
        }
      })
      .catch(() => navigate("/bible/matthew/1", { replace: true }));
  }, [bookSlug, navigate]);

  const isNumericSlug = /^\d+$/.test(bookSlug);

  const chapterQuery = useChapter(
    isNumericSlug ? undefined : bookSlug,
    isNumericSlug ? undefined : chapter,
    translationCode,
  );
  const navQuery = useNavigation(
    isNumericSlug ? undefined : bookSlug,
    isNumericSlug ? undefined : chapter,
  );

  const highlights = useHighlightsForChapter(bookSlug, chapter, {
    enabled: isAuthenticated && !isNumericSlug,
  });
  const chapterAudio = useChapterAudio(bookSlug, chapter, translationCode);

  const notesQuery = useNotes({ page: 1, enabled: isAuthenticated });

  const chapterVerseIds = useMemo(
    () => new Set(chapterQuery.data?.verses.map((v) => v.id) ?? []),
    [chapterQuery.data],
  );

  const chapterNotes = useMemo(() => {
    if (!notesQuery.data?.data) return [];
    return notesQuery.data.data.filter((n) => chapterVerseIds.has(n.verse_id));
  }, [notesQuery.data, chapterVerseIds]);

  // Reset selected verse when chapter changes
  useEffect(() => {
    selectVerse(null);
  }, [bookSlug, chapter, selectVerse]);

  // Auto-select verse from ?verse=N
  useEffect(() => {
    if (!targetVerseNumber) return;
    if (!chapterQuery.data) return;

    const match = chapterQuery.data.verses.find(
      (v) => v.verse_number === targetVerseNumber,
    );
    if (!match) return;

    if (selectedVerseId !== match.id) {
      selectVerse(match.id);
    }

    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLButtonElement>(
        `[data-verse-id="${match.id}"]`,
      );
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });

    const next = new URLSearchParams(searchParams);
    next.delete("verse");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetVerseNumber, chapterQuery.data]);

  // Keyboard: ← / → for chapter navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === "ArrowLeft" && navQuery.data?.previous) {
        const { book_slug, chapter: c } = navQuery.data.previous;
        navigate(`/bible/${book_slug}/${c}`);
      } else if (e.key === "ArrowRight" && navQuery.data?.next) {
        const { book_slug, chapter: c } = navQuery.data.next;
        navigate(`/bible/${book_slug}/${c}`);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navQuery.data, navigate]);

  const handleSelectVerse = (v: VerseOut) => {
    selectVerse(v.id);
    setCommentaryOpen(true);
  };

  const selectedVerse =
    chapterQuery.data?.verses.find((v) => v.id === selectedVerseId) ?? null;

  if (isNumericSlug) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-amharic text-sm text-text-muted">በመሄድ ላይ...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-shell">
      {/* Left: Book sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 border-r border-surface-border lg:block">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
          <BookSidebar currentSlug={bookSlug} currentChapter={chapter} />
        </div>
      </aside>

      {/* Center: Reading area */}
      <main className="min-w-0 flex-1">
        {/* Sticky audio player — pinned below navbar, full width of reading column */}
        {chapterAudio.data && (
          <div className="sticky top-14 z-30 w-full border-b border-surface-border bg-surface/95 backdrop-blur-sm">
            <AudioPlayer
              audio={chapterAudio.data}
              resetKey={`${bookSlug}/${chapter}`}
            />
          </div>
        )}

        <div className="mx-auto max-w-reading px-5 py-8 md:px-8 md:py-12">
          {/* Mobile toolbar */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-md p-2 text-text-secondary hover:bg-surface-raised hover:text-text-primary"
              aria-label="መጻሕፍት"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="font-amharic text-sm text-text-secondary truncate">
              {chapterQuery.data?.book.name_am ?? ""} {chapter}
            </span>
          </div>

          {/* Header */}
          {chapterQuery.isLoading && !chapterQuery.data ? (
            <ChapterHeaderSkeleton />
          ) : chapterQuery.data ? (
            <ChapterHeader
              book={chapterQuery.data.book}
              chapter={chapterQuery.data.chapter}
              translationName={chapterQuery.data.translation.name_am}
              chapterEthiopic={chapterQuery.data.chapter_ethiopic}
            />
          ) : null}

          {/* Verses */}
          {chapterQuery.isError ? (
            <ErrorState onRetry={() => chapterQuery.refetch()} />
          ) : chapterQuery.isLoading && !chapterQuery.data ? (
            <VerseListSkeleton />
          ) : !chapterQuery.data ? (
            <ErrorState onRetry={() => chapterQuery.refetch()} />
          ) : chapterQuery.data.verses.length === 0 ? (
            <EmptyState
              titleAm="ምዕራፉ ባዶ ነው"
              hintAm={`${chapterQuery.data.book.name_am} ${chapterQuery.data.chapter} ውስጥ ጥቅሶች አልተገኙም።`}
            />
          ) : (
            <>
              <VerseList
                verses={chapterQuery.data.verses}
                selectedVerseId={selectedVerseId}
                onSelectVerse={handleSelectVerse}
                highlights={highlights.data ?? []}
                notes={chapterNotes}
              />
              <ChapterNavigation nav={navQuery.data} />
            </>
          )}
        </div>
      </main>

      {/* Right: Commentary panel (desktop) */}
      <aside
        className={cn(
          "hidden shrink-0 border-l border-surface-border transition-all duration-300 lg:block",
          commentaryOpen && selectedVerse ? "w-[400px] xl:w-[440px]" : "w-0",
        )}
      >
        {commentaryOpen && selectedVerse && (
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
            <CommentaryPanel
              verse={selectedVerse}
              onClose={() => setCommentaryOpen(false)}
            />
          </div>
        )}
      </aside>

      {/* Mobile: Book drawer */}
      <Dialog.Root open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-72 border-r border-surface-border bg-stone-950 lg:hidden animate-fade-in">
            <Dialog.Title className="sr-only">መጻሕፍት</Dialog.Title>
            <div className="flex h-full flex-col pt-14">
              <BookSidebar
                currentSlug={bookSlug}
                currentChapter={chapter}
                onNavigate={() => setMobileSidebarOpen(false)}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Mobile: Commentary bottom sheet */}
      {commentaryOpen && selectedVerse && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[75vh] rounded-t-2xl border-t border-surface-border bg-surface lg:hidden animate-slide-up">
          <div className="mx-auto my-2 h-1 w-10 rounded-full bg-text-faint" />
          <div className="h-[70vh] overflow-hidden">
            <CommentaryPanel
              verse={selectedVerse}
              onClose={() => setCommentaryOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-16 text-center">
      <p className="font-amharic text-text-muted mb-4">ምዕራፉን መጫን አልተቻለም</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-surface-raised px-4 py-2 text-sm text-text-primary hover:bg-surface-sunken"
      >
        እንደገና ሞክር
      </button>
    </div>
  );
}
