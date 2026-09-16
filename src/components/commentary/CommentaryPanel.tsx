import { X, MessageCircle } from "lucide-react";
import { useCommentariesForVerse } from "@/api/queries/commentaries";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CommentaryCard } from "./CommentaryCard";
import { VerseTagsFooter } from "./VerseTagsFooter";

type CommentaryPanelVerse = {
  id: number;
  book?: string | null;
  chapter?: number | null;
  verse_number?: number | null;
  verse_number_ethiopic?: string | null;
  book_name_am?: string | null;
  text_am?: string | null;
};

type Props = {
  verse: CommentaryPanelVerse | null;
  onClose: () => void;
};

export function CommentaryPanel({ verse, onClose }: Props) {
  const { data, isLoading, isError } = useCommentariesForVerse(
    verse?.id ?? null,
  );

  return (
    <div className="flex h-full flex-col bg-stone-950">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-surface-border p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-text-faint font-medium">
            ትርጓሜ
          </p>
          {verse && (
            <p className="mt-1 font-amharic text-sm text-text-secondary truncate">
              {verse.book_name_am ?? ""} {verse.verse_number ?? ""}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="-mr-2 -mt-2 rounded-md p-2 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
          aria-label="ዝጋ"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable body: commentaries + tags footer */}
      <div className="flex-1 overflow-y-auto">
        {!verse ? (
          <div className="flex h-full items-center justify-center p-8">
            <p className="max-w-[240px] text-center font-amharic text-sm text-text-faint leading-relaxed">
              ትርጓሜ ለማየት ማንኛውንም ጥቅስ ይጫኑ
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="font-amharic text-sm text-text-muted">
              ትርጓሜዎችን መጫን አልተቻለም
            </p>
          </div>
        ) : data && data.commentaries.length === 0 ? (
          <EmptyState
            icon={<MessageCircle />}
            titleAm="ትርጓሜ አልተገኘም"
            hintAm="ለዚህ ጥቅስ እስካሁን ትርጓሜ አልተጨመረም።"
            className="py-12"
          />
        ) : (
          <div className="divide-y divide-surface-border">
            {data?.commentaries.map((c) => (
              <CommentaryCard key={c.id} commentary={c} />
            ))}
          </div>
        )}

        {/* Inline tags — always rendered when the verse has any */}
        {verse && (
          <VerseTagsFooter
            bookSlug={verse.book}
            chapter={verse.chapter}
            verseNumber={verse.verse_number}
          />
        )}
      </div>
    </div>
  );
}
