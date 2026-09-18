import { useState, useEffect } from "react";
import { Pencil, Check, X, Plus, Upload, Trash2 } from "lucide-react";
import { useBooks, useChapter, type VerseOut } from "@/api/queries/bible";
import {
  useUpdateVerse,
  useDeleteVerse,
  useCreateVerse,
} from "@/api/queries/admin";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiRequestError } from "@/api/client";
import { AdminVerseBulkImportModal } from "./AdminVerseBulkImportModal";
import { cn } from "@/lib/utils";

const textareaClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3 py-2",
  "font-amharic text-[15px] leading-[1.9] text-text-primary placeholder:text-text-faint",
  "transition-colors resize-none",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-surface-sunken/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-surface-sunken/60 focus:outline-none",
);

export function AdminVersesTab() {
  const [bookSlug, setBookSlug] = useState("matthew");
  const [chapter, setChapter] = useState(1);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [singleOpen, setSingleOpen] = useState(false);

  const books = useBooks();
  const chapterQuery = useChapter(bookSlug, chapter, "AMH1954");

  useEffect(() => {
    setChapter(1);
  }, [bookSlug]);

  const selectedBook = books.data?.find((b) => b.slug === bookSlug);
  const totalChapters = selectedBook?.total_chapters ?? 1;

  return (
    <>
      <div className="mb-6 rounded-xl border border-surface-border bg-surface-raised/20 p-4">
        <p className="mb-4 font-amharic text-[13px] font-medium text-text-secondary">
          ምዕራፍ ይምረጡ
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block font-amharic text-[12px] font-medium text-text-faint">
              መጽሐፍ
            </label>
            <select
              value={bookSlug}
              onChange={(e) => setBookSlug(e.target.value)}
              className={inputClass}
            >
              {books.data?.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name_am}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[12px] font-medium text-text-faint">
              ምዕራፍ
            </label>
            <input
              type="number"
              min={1}
              max={totalChapters}
              value={chapter}
              onChange={(e) =>
                setChapter(
                  Math.max(1, Math.min(totalChapters, Number(e.target.value))),
                )
              }
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={() => setSingleOpen(true)}>
            <Plus className="h-4 w-4" />
            አዲስ ጥቅስ
          </Button>
          <Button variant="subtle" onClick={() => setBulkOpen(true)}>
            <Upload className="h-4 w-4" />
            በጅምላ አስገባ
          </Button>
          {chapterQuery.data && (
            <span className="ml-2 font-amharic text-[12px] text-text-faint">
              {chapterQuery.data.verses.length} ጥቅሶች
            </span>
          )}
        </div>
      </div>

      {chapterQuery.isLoading ? (
        <VerseListSkeleton />
      ) : chapterQuery.isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ምዕራፉን መጫን አልተቻለም።" />
      ) : !chapterQuery.data || chapterQuery.data.verses.length === 0 ? (
        <EmptyState
          titleAm="በዚህ ምዕራፍ ጥቅሶች የሉም"
          hintAm="አንድ ጥቅስ ይፍጠሩ ወይም በጅምላ ያስገቡ።"
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => setSingleOpen(true)}>
                <Plus className="h-4 w-4" />
                አዲስ ጥቅስ
              </Button>
              <Button variant="subtle" onClick={() => setBulkOpen(true)}>
                <Upload className="h-4 w-4" />
                በጅምላ አስገባ
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-2">
          {chapterQuery.data.verses.map((v) => (
            <VerseRow
              key={v.id}
              verse={v}
              bookSlug={bookSlug}
              chapter={chapter}
            />
          ))}
        </div>
      )}

      <AdminVerseBulkImportModal
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        bookSlug={bookSlug}
        chapter={chapter}
      />
      <VerseCreateModal
        open={singleOpen}
        onOpenChange={setSingleOpen}
        bookSlug={bookSlug}
        chapter={chapter}
        nextVerseNumber={
          chapterQuery.data
            ? chapterQuery.data.verses.length > 0
              ? Math.max(
                  ...chapterQuery.data.verses.map((v) => v.verse_number),
                ) + 1
              : 1
            : 1
        }
      />
    </>
  );
}

function VerseRow({
  verse,
  bookSlug,
  chapter,
}: {
  verse: VerseOut;
  bookSlug: string;
  chapter: number;
}) {
  const updateMutation = useUpdateVerse();
  const deleteMutation = useDeleteVerse();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(verse.text_am);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setDraft(verse.text_am);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(verse.text_am);
    setError(null);
  };

  const save = async () => {
    setError(null);
    if (!draft.trim()) {
      setError("ይዘት ባዶ ነው");
      return;
    }
    if (draft.trim() === verse.text_am.trim()) {
      setEditing(false);
      return;
    }
    try {
      await updateMutation.mutateAsync({
        verseId: verse.id,
        payload: { text_am: draft.trim() },
      });
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  return (
    <div
      className={cn(
        "group rounded-xl border border-surface-border bg-surface-raised/10 p-4",
        "transition-colors",
        editing && "border-gold-500/40 bg-gold-500/[0.03]",
      )}
    >
      <div className="flex gap-3">
        <span className="mt-1 min-w-[2rem] shrink-0 text-right text-[13px] font-medium tabular-nums text-gold-500/80">
          {verse.verse_number_ethiopic ?? verse.verse_number}
        </span>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                autoFocus
                className={textareaClass}
              />
              {error && (
                <p className="font-amharic text-[13px] text-red-400">{error}</p>
              )}
            </div>
          ) : (
            <p className="whitespace-pre-line font-amharic text-[15px] leading-[1.9] text-text-primary">
              {verse.text_am}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-start gap-1">
          {editing ? (
            <>
              <button
                type="button"
                onClick={save}
                disabled={updateMutation.isPending}
                className={cn(
                  "rounded-md p-2 transition-colors",
                  "text-gold-500 hover:bg-gold-500/10",
                  updateMutation.isPending && "opacity-50",
                )}
                aria-label="አስቀምጥ"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-md p-2 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                aria-label="ሰርዝ"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={startEdit}
                className="rounded-md p-2 text-text-muted opacity-0 transition-all hover:bg-surface-raised hover:text-text-primary group-hover:opacity-100"
                aria-label="አርትዕ"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <ConfirmButton
                onConfirm={() => deleteMutation.mutate(verse.id)}
                busy={deleteMutation.isPending}
                className="opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="inline h-3.5 w-3.5" />
              </ConfirmButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VerseCreateModal({
  open,
  onOpenChange,
  bookSlug,
  chapter,
  nextVerseNumber,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookSlug: string;
  chapter: number;
  nextVerseNumber: number;
}) {
  const createMutation = useCreateVerse();
  const [verseNumber, setVerseNumber] = useState(nextVerseNumber);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setVerseNumber(nextVerseNumber);
      setText("");
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (!text.trim()) {
      setError("የጥቅሱ ይዘት ያስፈልጋል");
      return;
    }
    try {
      await createMutation.mutateAsync({
        translation_code: "AMH1954",
        book_slug: bookSlug,
        chapter,
        verse_number: verseNumber,
        text_am: text.trim(),
      });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.messageAm || err.message_en
          : "ስህተት ተፈጥሯል",
      );
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="አዲስ ጥቅስ"
      size="lg"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-surface-raised/30 px-3 py-2">
          <p className="font-amharic text-[12px] text-text-faint">
            {bookSlug} · ምዕራፍ {chapter}
          </p>
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የጥቅስ ቁጥር
          </label>
          <input
            type="number"
            min={1}
            value={verseNumber}
            onChange={(e) =>
              setVerseNumber(Math.max(1, Number(e.target.value)))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የጥቅሱ ይዘት
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            autoFocus
            placeholder="የጥቅሱ ጽሑፍ..."
            className={textareaClass}
          />
        </div>
        {error && (
          <p className="font-amharic text-[13px] text-red-400">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ሰርዝ
          </Button>
          <Button onClick={submit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "በማስቀመጥ ላይ..." : "አስቀምጥ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function VerseListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}
