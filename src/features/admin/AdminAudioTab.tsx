// src/features/admin/AdminAudioTab.tsx
import { useState } from "react";
import { Plus, Pencil, Headphones } from "lucide-react";
import { useBooks } from "@/api/queries/bible";
import {
  useAdminAudioList,
  useCreateAudio,
  useUpdateAudio,
  useDeleteAudio,
  type ChapterAudioOut,
} from "@/api/queries/audio";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-surface-border bg-stone-950/40",
  "px-3.5 py-2.5",
  "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
  "transition-colors",
  "focus:border-gold-500/40 focus:bg-stone-950/60 focus:outline-none",
);

export function AdminAudioTab() {
  const [page, setPage] = useState(1);
  const [bookFilter, setBookFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ChapterAudioOut | null>(null);

  const books = useBooks();
  const { data, isLoading, isError, isFetching } = useAdminAudioList({
    page,
    perPage: 100,
    bookSlug: bookFilter || undefined,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const deleteMutation = useDeleteAudio();

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={bookFilter}
            onChange={(e) => {
              setBookFilter(e.target.value);
              setPage(1);
            }}
            className={cn(inputClass, "w-auto")}
          >
            <option value="">ሁሉም መጽሐፍት</option>
            {books.data?.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name_am}
              </option>
            ))}
          </select>
          {meta && (
            <span className="text-[12px] tabular-nums text-text-faint">
              {meta.total} ድምጽ
            </span>
          )}
        </div>
        <Button onClick={() => setCreating(true)} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          አዲስ ድምጽ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState title="ስህተት ተፈጥሯል" hint="ድምጾቹን መጫን አልተቻለም" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Headphones />}
          title="ድምጽ የለም"
          hint="የመጀመሪያውን ድምጽ ይጨምሩ"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ ድምጽ
            </Button>
          }
        />
      ) : (
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-surface-border transition-opacity",
            isFetching ? "opacity-60" : "opacity-100",
          )}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border bg-surface-raised/20 text-left">
                <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                  መጽሐፍ
                </th>
                <th className="px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint">
                  ምዕራፍ
                </th>
                <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                  አንባቢ
                </th>
                <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint sm:table-cell">
                  ቆይታ
                </th>
                <th className="w-[160px] px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {items.map((a) => (
                <tr
                  key={a.id}
                  className={cn(
                    "transition-colors hover:bg-surface-raised/10",
                    !a.is_published && "opacity-60",
                  )}
                >
                  <td className="px-4 py-3">
                    <p className="font-amharic text-[15px] text-text-primary">
                      {a.book_name_am ?? a.book_slug}
                    </p>
                    {!a.is_published && (
                      <span className="mt-0.5 inline-block rounded-sm bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-amber-400">
                        ረቂቅ
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] tabular-nums text-text-muted">
                      {a.chapter}
                      {a.start_verse && a.end_verse
                        ? ` · ${a.start_verse}–${a.end_verse}`
                        : ""}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="font-amharic text-[13px] text-text-muted">
                      {a.reciter_name_am ?? a.reciter_name_en ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="text-[12px] tabular-nums text-text-faint">
                      {a.duration_seconds
                        ? `${Math.floor(a.duration_seconds / 60)}:${String(
                            a.duration_seconds % 60,
                          ).padStart(2, "0")}`
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(a)}
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                        aria-label="አርትዕ"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <ConfirmButton
                        onConfirm={() => deleteMutation.mutate(a.id)}
                        busy={deleteMutation.isPending}
                      >
                        ሰርዝ
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.pages > 1 && (
        <div className="mt-8">
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      )}

      <AudioEditorModal
        open={creating || Boolean(editing)}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        audio={editing}
      />
    </>
  );
}

function AudioEditorModal({
  open,
  onOpenChange,
  audio,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  audio: ChapterAudioOut | null;
}) {
  const isEdit = Boolean(audio);
  const createMutation = useCreateAudio();
  const updateMutation = useUpdateAudio();

  const [bookSlug, setBookSlug] = useState("matthew");
  const [chapter, setChapter] = useState(1);
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp3");
  const [duration, setDuration] = useState<number | "">("");
  const [reciterAm, setReciterAm] = useState("");
  const [reciterEn, setReciterEn] = useState("");
  const [sourceAm, setSourceAm] = useState("");
  const [notesAm, setNotesAm] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const books = useBooks();

  const handleOpenChange = (o: boolean) => {
    if (o) {
      if (audio) {
        setBookSlug(audio.book_slug ?? "matthew");
        setChapter(audio.chapter);
        setUrl(audio.url);
        setFormat(audio.format);
        setDuration(audio.duration_seconds ?? "");
        setReciterAm(audio.reciter_name_am ?? "");
        setReciterEn(audio.reciter_name_en ?? "");
        setSourceAm(audio.source_am ?? "");
        setNotesAm(audio.notes_am ?? "");
        setIsPublished(audio.is_published);
      } else {
        setBookSlug("matthew");
        setChapter(1);
        setUrl("");
        setFormat("mp3");
        setDuration("");
        setReciterAm("");
        setReciterEn("");
        setSourceAm("");
        setNotesAm("");
        setIsPublished(true);
      }
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (!url.trim()) {
      setError("የድምጽ URL ያስፈልጋል");
      return;
    }

    try {
      if (isEdit && audio) {
        await updateMutation.mutateAsync({
          id: audio.id,
          payload: {
            url: url.trim(),
            format,
            duration_seconds: duration === "" ? null : Number(duration),
            reciter_name_am: reciterAm.trim() || null,
            reciter_name_en: reciterEn.trim() || null,
            source_am: sourceAm.trim() || null,
            notes_am: notesAm.trim() || null,
            is_published: isPublished,
          },
        });
      } else {
        await createMutation.mutateAsync({
          book_slug: bookSlug,
          chapter,
          url: url.trim(),
          format,
          duration_seconds: duration === "" ? null : Number(duration),
          reciter_name_am: reciterAm.trim() || null,
          reciter_name_en: reciterEn.trim() || null,
          source_am: sourceAm.trim() || null,
          notes_am: notesAm.trim() || null,
          is_published: isPublished,
        });
      }
      onOpenChange(false);
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
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "ድምጽ አርትዕ" : "አዲስ ድምጽ"}
      size="lg"
    >
      <div className="space-y-4">
        {!isEdit && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
                መጽሐፍ
              </label>
              <select
                value={bookSlug}
                onChange={(e) => {
                  setBookSlug(e.target.value);
                  setChapter(1);
                }}
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
              <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
                ምዕራፍ
              </label>
              <input
                type="number"
                min={1}
                value={chapter}
                onChange={(e) =>
                  setChapter(Math.max(1, Number(e.target.value)))
                }
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የድምጽ URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://cdn.example.com/matthew-01.mp3"
            className={cn(inputClass, "font-mono text-[13px]")}
            autoFocus
          />
          <p className="mt-1 font-amharic text-[11px] text-text-faint">
            MP3 / M4A ፋይል መሆን አለበት። በአሁኑ ጊዜ ከS3 ወይም CDN ላይ የሚገኝ መሆን አለበት።
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ቅርጸት
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={inputClass}
            >
              <option value="mp3">MP3</option>
              <option value="m4a">M4A</option>
              <option value="ogg">OGG</option>
              <option value="wav">WAV</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ቆይታ (ሰከንድ) <span className="text-text-faint">(አማራጭ)</span>
            </label>
            <input
              type="number"
              min={0}
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="480"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ሁኔታ
            </label>
            <select
              value={isPublished ? "published" : "draft"}
              onChange={(e) => setIsPublished(e.target.value === "published")}
              className={inputClass}
            >
              <option value="published">ታትሟል</option>
              <option value="draft">ረቂቅ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              አንባቢ (አማርኛ)
            </label>
            <input
              type="text"
              value={reciterAm}
              onChange={(e) => setReciterAm(e.target.value)}
              placeholder="ቃሊ ተክለ ሚካኤል"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              Reciter (English)
            </label>
            <input
              type="text"
              value={reciterEn}
              onChange={(e) => setReciterEn(e.target.value)}
              placeholder="Qali Tekle Mikael"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ምንጭ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <input
            type="text"
            value={sourceAm}
            onChange={(e) => setSourceAm(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ማስታወሻ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <textarea
            value={notesAm}
            onChange={(e) => setNotesAm(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="font-amharic text-[13px] text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ሰርዝ
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "በማስቀመጥ ላይ..." : isEdit ? "አስቀምጥ" : "ፍጠር"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}
