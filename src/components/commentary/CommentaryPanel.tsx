import { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  FileText,
  Pencil,
  Check,
  Trash2,
} from "lucide-react";
import { useCommentariesForVerse } from "@/api/queries/commentaries";
import {
  useNotesForVerse,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "@/api/queries/user";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { CommentaryCard } from "./CommentaryCard";
import { VerseTagsFooter } from "./VerseTagsFooter";
import { VerseActions } from "@/components/bible/VerseActions";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";

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

const COLORS = [
  { key: "yellow", dot: "bg-gold-500", label: "ወርቃማ" },
  { key: "green", dot: "bg-emerald-500", label: "አረንጓዴ" },
  { key: "blue", dot: "bg-sky-500", label: "ሰማያዊ" },
  { key: "pink", dot: "bg-pink-500", label: "ሮዝ" },
] as const;

export function CommentaryPanel({ verse, onClose }: Props) {
  const commentaries = useCommentariesForVerse(verse?.id ?? null);
  const notes = useNotesForVerse(verse?.id ?? null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftColor, setDraftColor] = useState("yellow");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const existing = notes.data?.[0];
  const hasNotes = Boolean(notes.data && notes.data.length > 0);

  useEffect(() => {
    setEditing(false);
    setDraft(existing?.content_am ?? "");
    setDraftColor(existing?.color ?? "yellow");
    setError(null);
  }, [verse?.id, existing?.id]);

  const startEditing = () => {
    setDraft(existing?.content_am ?? "");
    setDraftColor(existing?.color ?? "yellow");
    setError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError(null);
  };

  const saveNote = async () => {
    if (!verse) return;
    setError(null);
    if (!draft.trim()) {
      setError("ማስታወሻው ባዶ ነው");
      return;
    }
    try {
      if (existing) {
        await updateMutation.mutateAsync({
          id: existing.id,
          verseId: verse.id,
          content_am: draft.trim(),
          color: draftColor,
        });
      } else {
        await createMutation.mutateAsync({
          verse_id: verse.id,
          content_am: draft.trim(),
          color: draftColor,
        });
      }
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  const removeNote = async () => {
    if (!existing || !verse) return;
    try {
      await deleteMutation.mutateAsync({ id: existing.id, verseId: verse.id });
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;

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

        <div className="flex items-center gap-2">
          {verse && (
            <VerseActions
              verseId={verse.id}
              bookSlug={verse.book ?? null}
              chapter={verse.chapter ?? null}
              verseNumber={verse.verse_number ?? null}
              onOpenNote={startEditing}
            />
          )}
          <button
            onClick={onClose}
            className="-mr-2 -mt-2 rounded-md p-2 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
            aria-label="ዝጋ"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!verse ? (
          <div className="flex h-full items-center justify-center p-8">
            <p className="max-w-[240px] text-center font-amharic text-sm text-text-faint leading-relaxed">
              ትርጓሜ ለማየት ማንኛውንም ጥቅስ ይጫኑ
            </p>
          </div>
        ) : (
          <>
            {/* Personal note — inline, above commentaries */}
            {(hasNotes || editing) && (
              <section className="border-b border-surface-border bg-gold-500/[0.03] p-5">
                <header className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gold-500/80">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-amharic text-[12px] font-medium uppercase tracking-wider">
                      የእኔ ማስታወሻ
                    </span>
                  </div>
                  {!editing && hasNotes && (
                    <button
                      type="button"
                      onClick={startEditing}
                      className="inline-flex items-center gap-1 text-[12px] text-text-muted transition-colors hover:text-text-primary"
                    >
                      <Pencil className="h-3 w-3" />
                      አርትዕ
                    </button>
                  )}
                </header>

                {!editing && hasNotes ? (
                  <div className="space-y-3">
                    {notes.data!.map((n) => (
                      <p
                        key={n.id}
                        className="font-amharic text-[15px] leading-[1.9] text-text-secondary whitespace-pre-line"
                      >
                        {n.content_am}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-colors",
                          colorBar(draftColor),
                        )}
                        aria-hidden
                      />
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={5}
                        autoFocus
                        placeholder="ስለዚህ ጥቅስ ያሰቡትን ይጻፉ..."
                        className={cn(
                          "w-full rounded-lg border border-surface-border bg-stone-950/50",
                          "pl-5 pr-3 py-3",
                          "font-amharic text-[15px] leading-[1.9] text-text-primary placeholder:text-text-faint",
                          "transition-colors resize-none",
                          "focus:border-gold-500/40 focus:bg-stone-950/70 focus:outline-none",
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-amharic text-[12px] text-text-muted">
                        ቀለም
                      </span>
                      {COLORS.map((c) => {
                        const active = draftColor === c.key;
                        return (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => setDraftColor(c.key)}
                            aria-label={c.label}
                            aria-pressed={active}
                            className={cn(
                              "h-5 w-5 rounded-full transition-all",
                              c.dot,
                              active
                                ? "ring-2 ring-offset-2 ring-offset-stone-950 ring-gold-500/50 scale-110"
                                : "opacity-60 hover:opacity-100 hover:scale-105",
                            )}
                          />
                        );
                      })}
                    </div>

                    {error && (
                      <p className="font-amharic text-[13px] text-red-400">
                        {error}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {existing ? (
                        <ConfirmButton
                          onConfirm={removeNote}
                          busy={deleteMutation.isPending}
                        >
                          <Trash2 className="inline h-3.5 w-3.5 mr-1 align-[-2px]" />
                          ሰርዝ
                        </ConfirmButton>
                      ) : (
                        <span />
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-md px-3 py-1.5 font-amharic text-[13px] text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                        >
                          ሰርዝ
                        </button>
                        <button
                          type="button"
                          onClick={saveNote}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-md bg-gold-500 px-3 py-1.5 font-amharic text-[13px] font-medium text-stone-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {busy ? "በማስቀመጥ ላይ..." : "አስቀምጥ"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Commentaries */}
            {commentaries.isLoading ? (
              <div className="space-y-4 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : commentaries.isError ? (
              <div className="p-8 text-center">
                <p className="font-amharic text-sm text-text-muted">
                  ትርጓሜዎችን መጫን አልተቻለም
                </p>
              </div>
            ) : commentaries.data &&
              commentaries.data.commentaries.length === 0 &&
              !hasNotes &&
              !editing ? (
              <EmptyState
                icon={<MessageCircle />}
                titleAm="ትርጓሜ አልተገኘም"
                hintAm="ለዚህ ጥቅስ እስካሁን ትርጓሜ አልተጨመረም።"
                className="py-12"
              />
            ) : commentaries.data &&
              commentaries.data.commentaries.length > 0 ? (
              <div className="divide-y divide-surface-border">
                {commentaries.data.commentaries.map((c) => (
                  <CommentaryCard key={c.id} commentary={c} />
                ))}
              </div>
            ) : null}
          </>
        )}

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

function colorBar(color: string): string {
  switch (color) {
    case "green":
      return "bg-emerald-500";
    case "blue":
      return "bg-sky-500";
    case "pink":
      return "bg-pink-500";
    default:
      return "bg-gold-500";
  }
}
