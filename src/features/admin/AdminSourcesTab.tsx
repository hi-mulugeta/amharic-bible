import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/client";
import { useAuthors } from "@/api/queries/authors";
import {
  useCreateSource,
  useDeleteSource,
  useUpdateSource,
  type SourceOut,
} from "@/api/queries/admin";
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

function useSourcesList(page: number) {
  return useQuery({
    queryKey: ["commentaries", "sources", page],
    queryFn: () =>
      request<{
        data: SourceOut[];
        meta: {
          page: number;
          per_page: number;
          total: number;
          pages: number;
          has_next: boolean;
          has_prev: boolean;
        };
      }>("/api/commentaries/sources", {
        query: { page, per_page: 50 },
      }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
}

export function AdminSourcesTab() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SourceOut | null>(null);

  const { data, isLoading, isError, isFetching } = useSourcesList(page);

  const sources = Array.isArray(data?.data) ? data!.data : [];
  const meta = data?.meta;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-amharic text-[13px] text-text-muted">
          ምንጮች የአባቶችን ሥራዎች ይወክላሉ — ለምሳሌ "ስብከቶች በማቴዎስ ወንጌል"።
        </p>
        <Button onClick={() => setCreating(true)} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          አዲስ ምንጭ
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <EmptyState titleAm="ስህተት ተፈጥሯል" hintAm="ምንጮችን መጫን አልተቻለም።" />
      ) : sources.length === 0 ? (
        <EmptyState
          titleAm="ምንጭ የለም"
          hintAm="አዲስ ምንጭ መፍጠር ይችላሉ።"
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              አዲስ ምንጭ
            </Button>
          }
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
                    ርዕስ
                  </th>
                  <th className="hidden px-4 py-3 font-amharic text-[12px] font-medium uppercase tracking-wider text-text-faint md:table-cell">
                    ደራሲ
                  </th>
                  <th className="w-[160px] px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {sources.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-surface-raised/10"
                  >
                    <td className="px-4 py-3">
                      <p className="font-amharic text-[15px] text-text-primary">
                        {s.title_am}
                      </p>
                      {s.title_en && (
                        <p className="mt-0.5 text-[12px] text-text-muted">
                          {s.title_en}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="font-amharic text-[13px] text-text-muted">
                        {s.author_name_am ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(s)}
                          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                          aria-label="አርትዕ"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <DeleteSourceButton sourceId={s.id} />
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

      <SourceEditorModal
        open={creating}
        onOpenChange={setCreating}
        mode="create"
      />
      <SourceEditorModal
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        mode="edit"
        source={editing}
      />
    </>
  );
}

function DeleteSourceButton({ sourceId }: { sourceId: number }) {
  const deleteMutation = useDeleteSource();
  const [force, setForce] = useState(false);

  return (
    <ConfirmButton
      onConfirm={async () => {
        try {
          await deleteMutation.mutateAsync({ sourceId });
        } catch (err) {
          if (err instanceof ApiRequestError && err.status === 409) {
            setForce(true);
            await deleteMutation.mutateAsync({ sourceId, force: true });
          }
        }
      }}
      busy={deleteMutation.isPending}
    >
      {force ? "በኃይል ሰርዝ" : "ሰርዝ"}
    </ConfirmButton>
  );
}

function SourceEditorModal({
  open,
  onOpenChange,
  mode,
  source,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  source?: SourceOut | null;
}) {
  const isEdit = mode === "edit";
  const createMutation = useCreateSource();
  const updateMutation = useUpdateSource(source?.id ?? null);
  const authors = useAuthors({ perPage: 200 });

  const [titleAm, setTitleAm] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [authorId, setAuthorId] = useState<number | "">("");
  const [sourceType, setSourceType] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("");
  const [translatorAm, setTranslatorAm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setTitleAm(source?.title_am ?? "");
      setTitleEn(source?.title_en ?? "");
      setAuthorId(source?.author_id ?? "");
      setSourceType(source?.source_type ?? "");
      setOriginalLanguage(source?.original_language ?? "");
      setTranslatorAm(source?.translator_am ?? "");
      setError(null);
    }
    onOpenChange(o);
  };

  const submit = async () => {
    setError(null);
    if (!titleAm.trim()) {
      setError("የአማርኛ ርዕስ ያስፈልጋል");
      return;
    }
    const payload = {
      title_am: titleAm.trim(),
      title_en: titleEn.trim() || null,
      author_id: authorId === "" ? null : Number(authorId),
      source_type: sourceType.trim() || null,
      original_language: originalLanguage.trim() || null,
      translator_am: translatorAm.trim() || null,
    };
    try {
      if (isEdit && source) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.messageAm || err.message_en);
      } else {
        setError("ስህተት ተፈጥሯል");
      }
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "ምንጭ አርትዕ" : "አዲስ ምንጭ"}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            የአማርኛ ርዕስ
          </label>
          <input
            type="text"
            value={titleAm}
            onChange={(e) => setTitleAm(e.target.value)}
            placeholder="ስብከቶች በማቴዎስ ወንጌል"
            className={inputClass}
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            English title <span className="text-text-faint">(optional)</span>
          </label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="Homilies on Matthew"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ደራሲ
          </label>
          <select
            value={authorId}
            onChange={(e) =>
              setAuthorId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className={inputClass}
          >
            <option value="">— ይምረጡ —</option>
            {(authors.data?.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name_am}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              ዓይነት
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              <option value="homily">ስብከት</option>
              <option value="treatise">ጽሑፍ</option>
              <option value="commentary">ትርጓሜ</option>
              <option value="letter">መልእክት</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
              የመጀመሪያ ቋንቋ
            </label>
            <input
              type="text"
              value={originalLanguage}
              onChange={(e) => setOriginalLanguage(e.target.value)}
              placeholder="Greek"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-amharic text-[13px] font-medium text-text-secondary">
            ተርጓሚ <span className="text-text-faint">(አማራጭ)</span>
          </label>
          <input
            type="text"
            value={translatorAm}
            onChange={(e) => setTranslatorAm(e.target.value)}
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
            {busy ? "በማስቀመጥ ላይ..." : "አስቀምጥ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}
