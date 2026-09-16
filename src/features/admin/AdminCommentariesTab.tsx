import { useState } from "react";
import { Plus, Layers, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/client";
import { useBooks } from "@/api/queries/bible";
import {
  useAdminCommentaries,
  useUpdateCommentary,
  useDeleteCommentary,
  useCreateCommentary,
  type AdminCommentaryOut,
  type SourceOut,
} from "@/api/queries/admin";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ApiRequestError } from "@/api/client";
import { AdminCommentaryBulkEditor } from "./AdminCommentaryBulkEditor";
import { toEthiopicNumeral } from "@/lib/ethiopic";
import { cn } from "@/lib/utils";

const textareaClass = cn(
  "w-full rounded-lg border border-surface-border bg-stone-950/40",
  "px-3 py-2",
  "font-amharic text-[15px] leading-[1.8] text-text-primary placeholder:text-text-faint",
  "transition-colors resize-none",
  "focus:border-gold-500/40 focus:bg-stone-950/60 focus:outline-none",
);

type Mode = "bulk" | "browse";

function useSourcesForPicker() {
  return useQuery({
    queryKey: ["commentaries", "sources", "all"],
    queryFn: () =>
      request<{
        data: SourceOut[];
        meta: { total: number };
      }>("/api/commentaries/sources", {
        query: { page: 1, per_page: 200 },
      }),
    staleTime: 5 * 60 * 1000,
  });
}

export function AdminCommentariesTab() {
  const [mode, setMode] = useState<Mode>("bulk");
  const sources = useSourcesForPicker();

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-grid grid-cols-2 gap-1 rounded-lg border border-surface-border bg-surface-raised/20 p-1">
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-4 py-2 font-amharic text-[14px] font-medium transition-colors",
              mode === "bulk"
                ? "bg-surface-raised text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            በምዕራፍ
          </button>
          <button
            type="button"
            onClick={() => setMode("browse")}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-4 py-2 font-amharic text-[14px] font-medium transition-colors",
              mode === "browse"
                ? "bg-surface-raised text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            ዝርዝር
          </button>
        </div>
      </div>

      {mode === "bulk" ? (
        <AdminCommentaryBulkEditor sources={sources.data?.data ?? []} />
      ) : (
        <BrowseCommentaries sources={sources.data?.data ?? []} />
      )}
    </>
  );
}

// ------------------------------------------------------------
// Browse mode
// ------------------------------------------------------------

function BrowseCommentaries({ sources }: { sources: SourceOut[] }) {
  const [page, setPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<number | undefined>(
    undefined,
  );
  const [editing, setEditing] = useState<AdminCommentaryOut | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isError, isFetching } = useAdminCommentaries({
    page,
    perPage: 50,
    sourceId: sourceFilter,
  });

  const items = Array.isArray(data?.data) ? data!.data : [];
  const meta = data?.meta;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <select
            value={sourceFilter ?? ""}
            onChange={(e) => {
              setSourceFilter(
                e.target.value === "" ? undefined : Number(e.target.value),
              );
              setPage(1);
            }}
            className="rounded-lg border border-surface-border bg-stone-950/40 px-3 py-2 font-amharic text-[13px] text-text-primary focus:border-gold-500/40 focus:outline-none"
          >
            <option value="">ሁሉም ምንጮች</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title_am}
              </option>
            ))}
          </select>
          {meta && (
            <span className="text-[12px] tabular-nums text-text-faint">
              {toEthiopicNumeral(meta.total)} ትርጓሜዎች
            </span>
          )}
        </div>

        <Button onClick={() => setCreating(true)} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          አዲስ ትርጓሜ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState
          titleAm="ስህተት ተፈጥሯል"
          hintAm="ትርጓሜዎችን መጫን አልተቻለም። (የአስተዳዳሪ ዝርዝር API እንዲጨመር ያስፈልጋል።)"
        />
      ) : items.length === 0 ? (
        <EmptyState
          titleAm="ትርጓሜ የለም"
          hintAm="በ'በምዕራፍ' ትርጓሜዎችን በጅምላ ማስገባት ይችላሉ።"
        />
      ) : (
        <>
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
                    ትርጓሜ
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                    ደራሲ
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint lg:table-cell">
                    ምንጭ
                  </th>
                  <th className="w-[140px] px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((c) => (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-surface-raised/10"
                  >
                    <td className="px-4 py-3">
                      <p className="line-clamp-2 font-amharic text-[14px] leading-[1.7] text-text-primary">
                        {c.excerpt_am ?? c.content_am.slice(0, 120)}
                      </p>
                      <p className="mt-1 text-[11px] text-text-faint">
                        #{c.id} · verse_id {c.verse_id}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="font-amharic text-[13px] text-text-muted">
                        {c.author?.name_am ?? "—"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="font-amharic text-[13px] text-text-muted">
                        {c.source ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(c)}
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                          aria-label="አርትዕ"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <DeleteCommentaryButton commentaryId={c.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.pages > 1 && (
            <div className="mt-8">
              <Pagination
                page={meta.page}
                totalPages={meta.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <CommentaryEditorModal
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        commentary={editing}
        sources={sources}
      />
      <CommentaryCreateModal
        open={creating}
        onOpenChange={setCreating}
        sources={sources}
      />
    </>
  );
}

function DeleteCommentaryButton({ commentaryId }: { commentaryId: number }) {
  const deleteMutation = useDeleteCommentary();
  return (
    <ConfirmButton
      onConfirm={() => deleteMutation.mutate(commentaryId)}
      busy={deleteMutation.isPending}
    >
      ሰርዝ
    </ConfirmButton>
  );
}

function CommentaryEditorModal({
  open,
  onOpenChange,
  commentary,
  sources,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  commentary: AdminCommentaryOut | null;
  sources: SourceOut[];
}) {
  const updateMutation = useUpdateCommentary(commentary?.id ?? null);
  const [content, setContent] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o && commentary) {
      setContent(commentary.content_am);
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    if (!commentary) return;
    setError(null);
    if (!content.trim()) {
      setError("ይዘት ያስፈልጋል");
      return;
    }
    try {
      await updateMutation.mutateAsync({ content_am: content.trim() });
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiRequestError)
        setError(err.messageAm || err.message_en);
      else setError("ስህተት ተፈጥሯል");
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={`ትርጓሜ #${commentary?.id ?? ""} አርትዕ`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-surface-raised/40 p-3">
          <p className="text-[11px] uppercase tracking-wider text-text-faint">
            Verse ID
          </p>
          <p className="mt-0.5 text-[13px] text-text-muted">
            #{commentary?.verse_id}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ይዘት
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className={textareaClass}
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          <span className="font-amharic text-[13px] text-text-secondary">
            የተረጋገጠ
          </span>
        </label>

        {error && (
          <p className="font-amharic text-[13px] text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ሰርዝ
          </Button>
          <Button onClick={submit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "በማስቀመጥ ላይ..." : "አስቀምጥ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CommentaryCreateModal({
  open,
  onOpenChange,
  sources,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sources: SourceOut[];
}) {
  const createMutation = useCreateCommentary();
  const [verseId, setVerseId] = useState<number | "">("");
  const [sourceId, setSourceId] = useState<number | "">("");
  const [content, setContent] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setVerseId("");
      setSourceId("");
      setContent("");
      setIsVerified(false);
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (verseId === "" || !content.trim()) {
      setError("verse_id እና ይዘት ያስፈልጋሉ");
      return;
    }
    try {
      await createMutation.mutateAsync({
        verse_id: Number(verseId),
        source_id: sourceId === "" ? null : Number(sourceId),
        content_am: content.trim(),
        is_verified: isVerified,
      });
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiRequestError)
        setError(err.messageAm || err.message_en);
      else setError("ስህተት ተፈጥሯል");
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="አዲስ ትርጓሜ"
      size="lg"
    >
      <div className="space-y-4">
        <p className="font-amharic text-[12px] text-text-muted">
          ለአንድ ጥቅስ አንድ ትርጓሜ። ለብዙ ጥቅሶች በአንድ ጊዜ ለማስገባት የ'በምዕራፍ' አማራጭን ይጠቀሙ።
        </p>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            Verse ID
          </label>
          <input
            type="number"
            value={verseId}
            onChange={(e) =>
              setVerseId(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="1"
            className="w-full rounded-lg border border-surface-border bg-stone-950/40 px-3.5 py-2.5 font-mono text-[15px] text-text-primary focus:border-gold-500/40 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-text-faint">
            በአንባቢው ውስጥ ጥቅሱን በመጫን የ verse ID ማግኘት ይችላሉ።
          </p>
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ምንጭ
          </label>
          <select
            value={sourceId}
            onChange={(e) =>
              setSourceId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full rounded-lg border border-surface-border bg-stone-950/40 px-3.5 py-2.5 font-amharic text-[15px] text-text-primary focus:border-gold-500/40 focus:outline-none"
          >
            <option value="">—</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title_am}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ይዘት
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={textareaClass}
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          <span className="font-amharic text-[13px] text-text-secondary">
            የተረጋገጠ
          </span>
        </label>

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

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
